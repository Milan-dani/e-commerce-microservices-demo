// routes/overview.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/overview
 * Returns high-level metrics for dashboard summary.
 */
router.get("/overview", async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};

    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    // Match all relevant events
    match.event = {
      $in: [
        "payment.success",
        "payment.failed",
        "order.created",
        "order.completed",
        "order.paid",
        "order.failed",
        "user.created",
        "product.viewed",
        "product.created",
        "cart.added"
      ]
    };

    const result = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$event",
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ["$event", "payment.success"] },
                { $toDouble: "$payload.amount" },
                0
              ]
            }
          }
        }
      }
    ]);

    // Convert aggregation results into dictionary
    const stats = {};
    result?.forEach?.((r) => (stats[r._id] = r));
    const totalRevenue = stats["payment.success"]?.totalAmount || 0;
    const totalTransactions = stats["payment.success"]?.count || 0;
    const failedTransactions = stats["payment.failed"]?.count || 0;
    const ordersCreated = stats["order.created"]?.count || 0;
    const ordersCompleted = stats["order.completed"]?.count || 0;
    const ordersPaid = stats["order.paid"]?.count || 0;
    const ordersFailed = stats["order.failed"]?.count || 0;
    const newUsers = stats["user.created"]?.count || 0;
    const viewed = stats["product.viewed"]?.count || 0;
    const addedToCart = stats["cart.added"]?.count || 0;
    const totalProductsCreated = stats["product.created"]?.count || 0;
    // Conversion rate calculations
    const placed = ordersCreated;
    const paid = totalTransactions;
    const conversionRate = viewed > 0 ? ((paid / viewed) * 100).toFixed(2) : 0;

    const funnel = {
      viewed,
      addedToCart,
      placed,
      paid,
      conversionRate: Number(conversionRate)
    };

    res.json({
      revenue: Number(totalRevenue.toFixed(2)),
      totalTransactions,
      failedTransactions,
      orders: {
        created: ordersCreated,
        completed: ordersCompleted,
        paid: ordersPaid,
        failed: ordersFailed
      },
      users: {
        new: newUsers
      },
      products: {
        created: totalProductsCreated
      },
      funnel
    });
  } catch (err) {
    console.error("GET /analytics/overview error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
