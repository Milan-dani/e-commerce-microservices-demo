// routes/timeline.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/timeline
 * Returns daily stats for revenue, orders, and users.
 */
router.get("/timeline", async (req, res) => {
  try {
    const { from, to } = req.query;

    const now = new Date();
    const defaultFrom = new Date();
    defaultFrom.setDate(now.getDate() - 7); // last 7 days

    const match = {
      timestamp: {
        $gte: from ? new Date(from) : defaultFrom,
        $lte: to ? new Date(to) : now
      },
      event: { $in: ["order.created", "payment.success", "user.created"] }
    };

    const results = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: { day: "$day", event: "$event" },
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$event", "payment.success"] },
                { $toDouble: "$payload.amount" },
                0
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id.day",
          orders: {
            $sum: {
              $cond: [{ $eq: ["$_id.event", "order.created"] }, "$count", 0]
            }
          },
          revenue: { $sum: "$totalRevenue" },
          users: {
            $sum: {
              $cond: [{ $eq: ["$_id.event", "user.created"] }, "$count", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = results.map((r) => ({
      day: r._id,
      orders: r.orders || 0,
      revenue: r.revenue || 0,
      newUsers: r.users || 0
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET /analytics/timeline error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
