require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
// const { connectNATS } = require("./natsConnection");
const { registerTopic, getTopics } = require("./topicRegistry");
const { syncWithConsul } = require("./consulIntegration");
const { logInfo } = require("./utils/logger");
const registerService = require("./utils/registerService");
const { connectNats, subscribe, subscribeEvent } = require("./utils/natsClient");
const {
  createMonitorConnection,
  listStreams,
  listConsumers,
  subscribeAdvisories,
} = require("@milan-dani/message-broker/monitor");

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

let advisoryEvents = [];
let streamCache = [];
let consumerCache = [];
async function initMonitor() {
  console.log("🚀 Connecting to NATS for monitoring...");
  const { nc, js, jsm } = await createMonitorConnection();

  // Collect stream & consumer data periodically
  async function refreshData() {
    streamCache = await listStreams();
    const allConsumers = [];
    for (const s of streamCache) {
      const consumers = await listConsumers(s.config.name);
      allConsumers.push({ stream: s.config.name, consumers });
    }
    consumerCache = allConsumers;
  }

  await refreshData();
  setInterval(refreshData, 5000); // refresh every 5s

  // Subscribe to JetStream advisories (activity, metrics, etc.)
  await subscribeAdvisories((subject, data) => {
    advisoryEvents.unshift({
      subject,
      type: subject.includes("ADVISORY")
        ? "Advisory"
        : subject.includes("METRIC")
        ? "Metric"
        : "Other",
      stream: data.stream || "-",
      timestamp: new Date().toLocaleTimeString(),
      data,
    });

    if (advisoryEvents.length > 100) advisoryEvents.pop();
  });

  // Return references if you want to access the data externally
  return {
    advisoryEvents,
    streamCache,
    consumerCache,
    refreshData,
  };
}
app.get("/dashboard", async (req, res) => {
  let html = `
    <html>
      <head>
        <title>📊 NATS Monitor Dashboard</title>
        <meta http-equiv="refresh" content="5">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; color: #333; }
          h1, h2 { color: #222; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background: #fafafa; }
          .small { font-size: 13px; color: #666; }
          .section { margin-bottom: 40px; }
          .metric { background: #e3f2fd; }
          .advisory { background: #e8f5e9; }
        </style>
      </head>
      <body>
        <h1>🧭 NATS Monitoring Dashboard</h1>
        <p class="small">Auto-refreshes every 5 seconds</p>

        <div class="section">
          <h2>📦 JetStream Streams</h2>
          <table>
            <tr>
              <th>Name</th>
              <th>Subjects</th>
              <th>Messages</th>
              <th>Consumers</th>
            </tr>`;

  for (const s of streamCache) {
    html += `<tr>
      <td>${s.config.name}</td>
      <td>${(s.config.subjects || []).join(", ")}</td>
      <td>${s.state.messages}</td>
      <td>${s.state.consumers}</td>
    </tr>`;
  }

  html += `</table></div>
  <div class="section">
    <h2>👥 Consumers</h2>
    <table>
      <tr>
        <th>Stream</th>
        <th>Consumer Name</th>
        <th>Delivered</th>
        <th>Ack Pending</th>
        <th>Last Active</th>
      </tr>`;

  for (const { stream, consumers } of consumerCache) {
    for (const c of consumers) {
      html += `<tr>
        <td>${stream}</td>
        <td>${c.name}</td>
        <td>${c.num_ack_pending}</td>
        <td>${c.delivered.stream_seq}</td>
        <td>${c.delivered.last || "N/A"}</td>
      </tr>`;
    }
  }

  html += `</table></div>
  <div class="section">
    <h2>📈 JetStream Advisories & Metrics</h2>
    <table>
      <tr>
        <th>Type</th>
        <th>Subject</th>
        <th>Stream</th>
        <th>Time</th>
        <th>Data (truncated)</th>
      </tr>`;

  for (const ev of advisoryEvents.slice(0, 30)) {
    html += `<tr class="${ev.type.toLowerCase()}">
      <td>${ev.type}</td>
      <td>${ev.subject}</td>
      <td>${ev.stream}</td>
      <td>${ev.timestamp}</td>
      <td><pre style="font-size:11px;">${JSON.stringify(ev.data).slice(
        0,
        100
      )}...</pre></td>
    </tr>`;
  }

  html += `
    </table>
    </div>
  </body>
  </html>
  `;

  res.send(html);
});

// health check for consul
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
// // Dynamic registration
// registerService(SERVICE_NAME, PORT);
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
  // await connectNATS();
  // await connectNats();
  await startMonitoring();
  logInfo(`[Broker] Message Broker Service running on port ${PORT}`);
  console.log(`Message Broker Service running on port ${PORT}`);
  registerService(SERVICE_NAME, PORT);

  await initMonitor();
});