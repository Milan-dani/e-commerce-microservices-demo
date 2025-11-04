// routes/summary.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/summary
 * Returns overview stats for the admin dashboard
 */
router.get("/summary", async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const dateFilter = {};
    if (from) dateFilter.$gte = from;
    if (to) dateFilter.$lte = to;
    const matchStage = Object.keys(dateFilter).length
      ? { timestamp: dateFilter }
      : {};

    // Query only relevant event types
    const events = await Event.aggregate([
      { $match: { ...matchStage } },
      {
        $group: {
          _id: "$event",
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $cond: [
                { $or: [{ $eq: ["$event", "payment.success"] }] },
                "$payload.amount",
                0
              ]
            }
          }
        }
      }
    ]);

    // Initialize summary defaults
    const summary = {
      totalRevenue: 0,
      totalTransactions: 0,
      orders: {
        created: 0,
        placed: 0,
        completed: 0,
        failed: 0,
        pending: 0
      },
      payments: {
        success: 0,
        failed: 0
      },
      newUsers: 0
    };

    for (const e of events) {
      switch (e._id) {
        case "payment.success":
          summary.totalRevenue += e.totalAmount;
          summary.payments.success += e.count;
          summary.totalTransactions += e.count;
          break;
        case "payment.failed":
          summary.payments.failed += e.count;
          summary.totalTransactions += e.count;
          break;
        case "order.created":
          summary.orders.created += e.count;
          break;
        case "order.placed":
          summary.orders.placed += e.count;
          break;
        case "order.completed":
          summary.orders.completed += e.count;
          break;
        case "order.failed":
          summary.orders.failed += e.count;
          break;
        case "order.pending":
          summary.orders.pending += e.count;
          break;
        case "user.created":
          summary.newUsers += e.count;
          break;
      }
    }

    res.json(summary);
  } catch (err) {
    console.error("GET /analytics/summary error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
