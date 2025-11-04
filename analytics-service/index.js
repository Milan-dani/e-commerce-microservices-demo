require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const registerService = require("./serviceRegistry/registerService");
const { authenticate, requireAdmin } = require("./middleware/authMiddleware");
const Event = require("./models/Event");
const NodeCache = require("node-cache");
const { initBroker } = require("@milan-dani/message-broker");

const analyticsRoutes = require("./routes/analytics");
const summaryRoutes = require("./routes/summary");
const conversionRoutes = require("./routes/conversion");
const productsRoutes = require("./routes/products");
const timelineRoutes = require("./routes/timeline");
const customersRoutes = require("./routes/customers");
const overviewRoutes = require("./routes/overview");
const paymentsRoutes = require("./routes/payments");
const userRoutes = require("./routes/user");
const ordersRoutes = require("./routes/orders");
const eventsRoutes = require("./routes/events");
const app = express();
app.use(express.json());
let broker;
const cache = new NodeCache({ stdTTL: 30 }); // 30s cache

const PORT = process.env.PORT || 3008;
const SERVICE_NAME = process.env.SERVICE_NAME || "analytics";
const JS_STREAM = process.env.JS_STREAM || "ECOM_EVENTS";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/analytics";

// Dynamic registration
// registerService(SERVICE_NAME, PORT);


// app.use("/analytics", analyticsRoutes);
// app.use("/analytics", summaryRoutes);
// app.use("/analytics", conversionRoutes);
// app.use("/analytics", productsRoutes);
// app.use("/analytics", timelineRoutes);
// app.use("/analytics", customersRoutes);
// app.use("/analytics", overviewRoutes);
// app.use("/analytics", paymentsRoutes);
// app.use("/analytics", userRoutes);
// app.use("/analytics", ordersRoutes);
// app.use("/analytics", eventsRoutes);
app.use("/", analyticsRoutes);
app.use("/", summaryRoutes);
app.use("/", conversionRoutes);
app.use("/", productsRoutes);
app.use("/", timelineRoutes);
app.use("/", customersRoutes);
app.use("/", overviewRoutes);
app.use("/", paymentsRoutes);
app.use("/", userRoutes);
app.use("/", ordersRoutes);
app.use("/", eventsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function subscriptionHandler_ForAllTopics(broker) {
  // Subscribe to ALL events from the stream
  broker.subscribe(
    ">",
    async (data, subject) => {
      console.log(`📩 Event received: ${subject}`);
      try {
        await Event.create({
          event: subject,
          source: data.source || "unknown",
          payload: data,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        });
        console.log(`📊 Analytics saved event: ${subject}`);
      } catch (error) {
        console.log(`❌ Analytics couldn't save event: ${subject}`);
      }
    }
    // { ack: false, jetstream: false} // ✅ no-ack mode required
  );
}

const DEFAULT_TOPICS = [
  "user.created", //
  "user.loggedin",// 
  "order.created",// 
  "order.paid", //
  "order.status.updated",//
  "payment.success", //
  "payment.failed", //
  "product.created", //
  "product.viewed", //
  "product.updated", //
  "product.deleted", //
  "product.decremented", //
  "cart.item.added", //
];

const TOPICS = process.env.TOPICS
  ? [...process.env.TOPICS.split(",")]
  : [...DEFAULT_TOPICS];
// : ["product.*","order.*", "payment.*", "user.*"];
async function subscriptionHandler_ForSelectedTopics(broker) {
  // Subscribe only to given topics
  for (const topic of TOPICS) {
    broker.subscribe(
      topic,
      async (data, subject) => {
        console.log(`📩 Event received: ${subject}`);
        try {
          await Event.create({
            event: topic,
            source: data.source || "unknown",
            payload: data,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          });
          console.log(`📊 Analytics saved event: ${topic}`);
        } catch (error) {
          console.log(`❌ Analytics couldn't save event: ${topic}`);
        }
      }
      // { ack: false, jetstream: false }
    ); // ✅ no-ack mode required
  }
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`Analytics Service running on port ${PORT}`);
      await registerService(SERVICE_NAME, PORT);

      broker = await initBroker({
        serviceName: SERVICE_NAME,
        stream: JS_STREAM,
      });
      await new Promise((r) => setTimeout(r, 500)); // small delay helps stabilize connection
      // await subscriptionHandler(broker);
      // await subscriptionHandler_ForAllTopics(broker);
      await subscriptionHandler_ForSelectedTopics(broker);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
