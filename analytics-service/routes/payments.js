// routes/payments.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/payments
 * Provides payment analytics: total success, failed, amounts, and success rate.
 *
 * Optional Query Params:
 *  - from (ISO date)
 *  - to (ISO date)
 *  - groupBy=day (to group payments by date)
 */
router.get("/payments", async (req, res) => {
  try {
    const { from, to, groupBy } = req.query;

    const match = {
      event: { $in: ["payment.success", "payment.failed"] },
    };

    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    // Base aggregation
    const baseAgg = [
      { $match: match },
      {
        $group: {
          _id: groupBy === "day" ? "$day" : null,
          totalPayments: { $sum: 1 },
          totalSuccess: {
            $sum: { $cond: [{ $eq: ["$event", "payment.success"] }, 1, 0] },
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ["$event", "payment.failed"] }, 1, 0] },
          },
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ["$event", "payment.success"] },
                { $toDouble: "$payload.amount" },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          day: groupBy === "day" ? "$_id" : null,
          totalPayments: 1,
          totalSuccess: 1,
          totalFailed: 1,
          totalAmount: 1,
          successRate: {
            $cond: [
              { $eq: ["$totalPayments", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$totalSuccess", "$totalPayments"] },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: groupBy === "day" ? { day: 1 } : {} },
    ];

    const result = await Event.aggregate(baseAgg);

    if (!groupBy) {
      // Summarize totals if not grouped by day
      const totals = result[0] || {
        totalPayments: 0,
        totalSuccess: 0,
        totalFailed: 0,
        totalAmount: 0,
        successRate: 0,
      };
      return res.json(totals);
    }

    res.json(result);
  } catch (err) {
    console.error("GET /analytics/payments error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
