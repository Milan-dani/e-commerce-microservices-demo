// routes/orders.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/orders
 * Provides order analytics and summary.
 *
 * Optional query params:
 *  - from (ISO date)
 *  - to (ISO date)
 */
router.get("/orders", async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {
      event: {
        $in: [
          "order.created",
          "order.paid",
          "order.completed",
          "order.failed",
          "order.cancelled",
        ],
      },
    };

    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    // 1️⃣ Aggregate order counts by status
    const orderStats = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$event",
          count: { $sum: 1 },
          totalAmount: { $sum: "$payload.total" },
        },
      },
    ]);

    // 2️⃣ Convert to readable format
    const summary = {
      created: 0,
      paid: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    //   totalRevenue: 0,
      //   totalOrders: 0,
    };
    let totalOrders = 0;
    let totalRevenue = 0;
    orderStats.forEach((stat) => {
      const event = stat._id;
      const count = stat.count || 0;
      const amount = stat.totalAmount || 0;

      if (event === "order.created") summary.created = count;
      if (event === "order.paid") {
        summary.paid = count;
        // summary.totalRevenue += amount;
        totalRevenue += amount;
      }
      if (event === "order.completed") {
        summary.completed = count;
        // summary.totalRevenue += amount;
      }
      if (event === "order.failed") summary.failed = count;
      if (event === "order.cancelled") summary.cancelled = count;

      //   summary.totalOrders += count;
      totalOrders += count;
     
    });

    // 3️⃣ Order trend over time (for charts)
    const trend = await Event.aggregate([
      {
        $match: {
          event: { $in: ["order.completed", "order.paid"] },
          ...(match.timestamp && { timestamp: match.timestamp }),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          total: {
            $sum: {
              $cond: [
                { $eq: ["$event", "order.paid"] },
                { $toDouble: "$payload.total" },
                0,
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({ summary, trend, totalOrders, totalRevenue });
  } catch (err) {
    console.error("GET /analytics/orders error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
