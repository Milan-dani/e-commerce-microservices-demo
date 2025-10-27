require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const { connectNATS } = require("./natsConnection");
const { registerTopic, getTopics } = require("./topicRegistry");
const { syncWithConsul } = require("./consulIntegration");
const { logInfo } = require("./utils/logger");
const registerService = require("./utils/registerService");
const { connectNats, subscribe, subscribeEvent } = require("./utils/natsClient");

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let eventStats = {}; // { subject: count }

const PORT = process.env.PORT || 3009;
const CONSUL_URL = process.env.CONSUL_URL || "http://localhost:8500";
const SERVICE_NAME = process.env.SERVICE_NAME || 'message-broker';

// Register a new service’s topics
app.post("/register-subscriber", async (req, res) => {
  const { service, topics } = req.body;
  if (!service || !topics?.length)
    return res.status(400).json({ error: "Missing service or topics" });

  topics.forEach((t) => registerTopic(service, t));
  
  await syncWithConsul(service, topics);
  io.emit("registryUpdate", { topics: getTopics() });

  res.json({ message: "Registered successfully", topics });
});

// ========== Publish Event ==========
app.post("/publish", async (req, res) => {
  const { subject, payload } = req.body;
  if (!subject || !payload)
    return res.status(400).json({ error: "subject and payload required" });

  const nc = await connectNATS();
  const codec = getCodec();

  try {
    nc.publish(subject, codec.encode(payload));
    // update stats
    if (!eventStats[subject]) eventStats[subject] = { count: 0, lastPublished: null };
    eventStats[subject].count++;
    eventStats[subject].lastPublished = new Date().toISOString();

    // notify dashboard
    io.emit("eventStatsUpdate", eventStats);

    // sync with Consul
    await axios.post(`${CONSUL_URL}/update-event-stats`, {
      subject,
      timestamp: eventStats[subject].lastPublished,
    }).catch(() => {});

    res.json({ message: "Event published", subject, count: eventStats[subject].count });
  } catch (err) {
    logError("Publish failed", err);
    res.status(500).json({ error: err.message });
  }
});

// List all registered topics
app.get("/topics", (req, res) => res.json(getTopics()));
app.get("/events-stats", (req, res) => res.json(eventStats));

// Simple frontend to view Events
app.get("/ui", (req, res) => {
  res.sendFile(__dirname + "/dashboard.html");
});


// health check for consul
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
// Dynamic registration
registerService(SERVICE_NAME, PORT);
async function startMonitoring() {
  await connectNats();
  // subscribe to wildcard (all subjects) - use plain subscribe if not JetStream
  await subscribeEvent(">", async (data, msg) => {
    
    const subject = msg?.subject || msg?.sid || "unknown";
    const s = subject;
    if (!eventStats[s]) eventStats[s] = { count: 0, lastPublished: null };
    eventStats[s].count++;
    eventStats[s].lastPublished = new Date().toISOString();

    // periodic sync (fire-and-forget)
    try {
      await fetch(`${CONSUL_URL}/update-event-stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: s,
          timestamp: eventStats[s].lastPublished,
        }),
      }).catch(() => {});
    } catch (e) {
      console.warn("[Monitor] consul sync failed", e.message);
    }
    
  }, { jetstream: false }); // use plain subscribe for monitoring (low overhead)
}


// ========== Socket.IO Live Dashboard ==========
io.on("connection", (socket) => {
  socket.emit("registryUpdate", { topics: getTopics() });
  socket.emit("eventStatsUpdate", eventStats);
});

// app.listen(PORT, async () => {
//   await connectNATS();
//   logInfo(`[Broker] Message Broker Service running on port ${PORT}`);
//   console.log(`Message Broker Service running on port ${PORT}`);
// });
server.listen(PORT, async () => {
  await connectNATS();
  startMonitoring();
  logInfo(`[Broker] Message Broker Service running on port ${PORT}`);
  console.log(`Message Broker Service running on port ${PORT}`);
});