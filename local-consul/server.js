require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
// const fetch = require("node-fetch");
const {
  createMonitorConnection,
  listStreams,
  listConsumers,
  subscribeAdvisories,
} = require("@milan-dani/message-broker/monitor");

const app = express();
app.use(bodyParser.json());

// Registry: serviceName -> array of instances
// Each instance: { url, status, lastCheck, failedChecks }
const registry = {};
// new event registry for message broker
const eventRegistry = {}; // { eventName: [serviceNames...] }
const eventStats = {}; // { eventName: { count, lastPublished } }

// Health check config
const HEALTH_CHECK_INTERVAL = 5000;
const MAX_FAILED_CHECKS = 3;

// Register a service instance
app.post("/register", (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).send("name and url are required");

  if (!registry[name]) registry[name] = [];

  // Avoid duplicate registrations
  if (!registry[name].some((inst) => inst.url === url)) {
    registry[name].push({
      url,
      status: "unknown",
      lastCheck: null,
      failedChecks: 0,
    });
  }

  res.send(`Service ${name} registered at ${url}`);
});

// register events (used by message-broker)
app.post("/register-events", (req, res) => {
  const { service, topics } = req.body;
  if (!service || !topics?.length)
    return res.status(400).send("service and topics are required");

  topics.forEach((topic) => {
    if (!eventRegistry[topic]) eventRegistry[topic] = [];
    if (!eventRegistry[topic].includes(service)) {
      eventRegistry[topic].push(service);
    }
  });

  res.json({ message: `Events registered for ${service}`, events: topics });
});
// ========== Event Stats Sync (from Broker) ==========
app.post("/update-event-stats", (req, res) => {
  const { subject, timestamp } = req.body;
  if (!subject) return res.status(400).send("subject required");

  if (!eventStats[subject])
    eventStats[subject] = { count: 0, lastPublished: null };
  eventStats[subject].count++;
  eventStats[subject].lastPublished = timestamp || new Date().toISOString();

  res.send("Event stats updated");
});

// Deregister a service instance
app.post("/deregister", (req, res) => {
  const { name, url } = req.body;
  if (!name || !registry[name])
    return res.status(400).send("Service not found");

  registry[name] = registry[name].filter((inst) => inst.url !== url);

  if (registry[name].length === 0) delete registry[name];

  res.send(`Service ${name} deregistered at ${url}`);
});

// Discover a healthy instance of a service (round-robin)
const roundRobinCounters = {};

app.get("/discover/:name", (req, res) => {
  const instances = registry[req.params.name]?.filter(
    (inst) => inst.status === "healthy"
  );

  if (!instances || instances.length === 0)
    return res.status(404).send("No healthy instances found");

  // Round-robin selection
  const index = roundRobinCounters[req.params.name] || 0;
  const instance = instances[index % instances.length];
  roundRobinCounters[req.params.name] = (index + 1) % instances.length;

  res.json({ url: instance.url });
});

// List all services
app.get("/services", (req, res) => res.json(registry));
// List all events
app.get("/events", (req, res) => res.json(eventRegistry));
app.get("/events/stats", (req, res) => res.json(eventStats));

// Health check
async function healthCheck() {
  for (const [name, instances] of Object.entries(registry)) {
    for (let i = instances.length - 1; i >= 0; i--) {
      const inst = instances[i];
      // const response = await fetch(inst.url);
      // console.log("-----",inst, response);

      try {
        const response = await fetch(`${inst.url}/health`);
        if (response.ok) {
          inst.status = "healthy";
          inst.failedChecks = 0;
        } else {
          inst.failedChecks++;
          inst.status = "unhealthy";
        }
      } catch {
        inst.failedChecks++;
        inst.status = "unhealthy";
      }
      inst.lastCheck = new Date().toISOString();

      if (inst.failedChecks >= MAX_FAILED_CHECKS) {
        console.log(`Removing ${name} instance ${inst.url} due to failures`);
        instances.splice(i, 1);
      }
    }
    if (instances.length === 0) delete registry[name];
  }
}

// setInterval(healthCheck, HEALTH_CHECK_INTERVAL);

// Simple frontend to view services
// app.get("/ui", (req, res) => {
//   let html = `
//       <html>
//         <head>
//           <title>Local Consul UI</title>
//           <meta http-equiv="refresh" content="5">
//           <style>
//             body { font-family: Arial; padding: 20px; }
//             h1 { color: #333; }
//             table { border-collapse: collapse; width: 100%; }
//             th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
//             th { background-color: #f2f2f2; }
//             tr.healthy { background-color: #d4edda; }
//             tr.unhealthy { background-color: #f8d7da; }
//           </style>
//         </head>
//         <body>
//           <h1>Registered Services</h1>
//           <table>
//             <tr>
//               <th>Service Name</th>
//               <th>Instance URL</th>
//               <th>Status</th>
//               <th>Last Health Check</th>
//             </tr>`;

//   for (const [name, instances] of Object.entries(registry)) {
//     instances.forEach((inst) => {
//       html += `<tr class="${inst.status}">
//           <td>${name}</td>
//           <td>${inst.url}</td>
//           <td>${inst.status}</td>
//           <td>${inst.lastCheck || "N/A"}</td>
//         </tr>`;
//     });
//   }

//   html += `
//           </table>
//         </body>
//       </html>
//     `;

//   res.send(html);
// });
// Simple frontend to view services, events, and stats
app.get("/ui", (req, res) => {
  let html = `
      <html>
        <head>
          <title>Local Consul UI</title>
          <meta http-equiv="refresh" content="5">
          <style>
            body { font-family: Arial; padding: 20px; background-color: #f9f9f9; }
            h1, h2 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #f2f2f2; }
            tr.healthy { background-color: #d4edda; }
            tr.unhealthy { background-color: #f8d7da; }
            .small { color: #555; font-size: 13px; }
            .section { margin-bottom: 40px; }
          </style>
        </head>
        <body>
          <h1>🧭 Local Consul Dashboard</h1>
          <p class="small">Auto-refreshes every 5 seconds</p>

          <div class="section">
            <h2>🔧 Registered Services</h2>
            <table>
              <tr>
                <th>Service Name</th>
                <th>Instance URL</th>
                <th>Status</th>
                <th>Last Health Check</th>
              </tr>`;

  for (const [name, instances] of Object.entries(registry)) {
    instances.forEach((inst) => {
      html += `<tr class="${inst.status}">
          <td>${name}</td>
          <td>${inst.url}</td>
          <td>${inst.status}</td>
          <td>${inst.lastCheck || "N/A"}</td>
        </tr>`;
    });
  }

  html += `
            </table>
          </div>

          <div class="section">
            <h2>📨 Registered Event Topics</h2>
            <table>
              <tr>
                <th>Event Name</th>
                <th>Subscribed Services</th>
              </tr>`;

  for (const [event, services] of Object.entries(eventRegistry)) {
    html += `<tr>
        <td>${event}</td>
        <td>${services.join(", ")}</td>
      </tr>`;
  }

  html += `
            </table>
          </div>

          <div class="section">
            <h2>📊 Event Publish Stats</h2>
            <table>
              <tr>
                <th>Event</th>
                <th>Publish Count</th>
                <th>Last Published</th>
              </tr>`;

  for (const [event, stats] of Object.entries(eventStats)) {
    html += `<tr>
        <td>${event}</td>
        <td>${stats.count}</td>
        <td>${stats.lastPublished || "N/A"}</td>
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

// app.get("/dashboard", async (req, res) => {
//   // const stats = await monitorBroker.getStats();
//   // res.json(stats);
//   res.json({message : "ok"});
// });

// / --- Dashboard Route ---

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

const PORT = process.env.PORT || 8500;
app.listen(PORT, async () => {
  console.log(`Local Consul running at http://localhost:${PORT}`);
  setInterval(healthCheck, HEALTH_CHECK_INTERVAL);
  await initMonitor();
});
