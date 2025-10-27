require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const registerService = require("./serviceRegistry/registerService");
const { authenticate, requireAdmin } = require("./middleware/authMiddleware");
const { registerService, startListening } = require("./subscriber");
const Event = require("./models/Event");
const NodeCache = require("node-cache");

const app = express();
app.use(express.json());
const cache = new NodeCache({ stdTTL: 30 }); // 30s cache

const PORT = process.env.PORT || 3008;
const SERVICE_NAME = process.env.SERVICE_NAME || "analytics";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/analytics";

// Dynamic registration
// registerService(SERVICE_NAME, PORT);

// Register in Consul + Broker and subscribe to events
// registerService().then(startListening);
// registerService();

// 🧩 Fetch raw events (with filters)
app.get("/events", authenticate, requireAdmin, async (req, res) => {
  const { event, from, to, userId } = req.query;
  const query = {};

  if (event) query.event = event;
  if (userId) query.userId = userId;
  if (from || to) query.timestamp = {};
  if (from) query.timestamp.$gte = new Date(from);
  if (to) query.timestamp.$lte = new Date(to);

  const events = await Event.find(query).sort({ timestamp: -1 }).limit(100);
  res.json(events);
});

// 📊 Daily summary (group by day)
app.get("/summary", authenticate, requireAdmin, async (req, res) => {
  const cacheKey = "analytics:summary";
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  const summary = await Event.aggregate([
    {
      $group: {
        _id: "$event",
        count: { $sum: 1 },
        last: { $max: "$timestamp" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  cache.set(cacheKey, summary);
  res.json(summary);
});

// 📈 Trend report: daily order/revenue/user growth
app.get("/trends", authenticate, requireAdmin, async (req, res) => {
  const cacheKey = "analytics:trends";
  if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

  const pipeline = [
    {
      $match: {
        event: { $in: ["order.placed", "payment.success", "user.signup"] },
      },
    },
    {
      $group: {
        _id: { event: "$event", day: "$day" },
        count: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ["$event", "payment.success"] },
              "$payload.amount",
              0,
            ],
          },
        },
      },
    },
    { $sort: { "_id.day": 1 } },
  ];

  const result = await Event.aggregate(pipeline);
  cache.set(cacheKey, result);
  res.json(result);
});

// 🧮 Funnel (conversion metrics)
app.get("/funnel", authenticate, requireAdmin, async (req, res) => {
  const viewed = await Event.countDocuments({ event: "product.viewed" });
  const carted = await Event.countDocuments({ event: "product.added_to_cart" });
  const placed = await Event.countDocuments({ event: "order.placed" });

  res.json({
    viewed,
    added_to_cart: carted,
    orders_placed: placed,
    conversion_rate: viewed ? ((placed / viewed) * 100).toFixed(2) + "%" : "0%",
  });
});

// Analytics Endpoints
app.get("/analytics/orders", async (req, res) => {
  const count = await Event.countDocuments({ event: "order.created" });
  const placed = await Event.countDocuments({ event: "order.placed" });
  res.json({ orders_created: count, orders_placed: placed });
});

app.get("/analytics/revenue", async (req, res) => {
  const payments = await Event.find({ event: "payment.success" });
  const total = payments.reduce((sum, e) => sum + (e.payload.amount || 0), 0);
  res.json({ total_revenue: total, transactions: payments.length });
});

app.get("/analytics/users", async (req, res) => {
  const signups = await Event.countDocuments({ event: "user.signup" });
  const logins = await Event.countDocuments({ event: "user.login" });
  res.json({ new_users: signups, active_logins: logins });
});

app.get("/analytics/funnel", async (req, res) => {
  const viewed = await Event.countDocuments({ event: "product.viewed" });
  const carted = await Event.countDocuments({ event: "product.added_to_cart" });
  const placed = await Event.countDocuments({ event: "order.placed" });

  res.json({
    viewed,
    added_to_cart: carted,
    orders_placed: placed,
    conversion_rate: viewed ? ((placed / viewed) * 100).toFixed(2) + "%" : "0%",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`Analytics Service running on port ${PORT}`);
      await registerService().then(startListening);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
