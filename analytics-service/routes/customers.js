// routes/customers.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/customers
 * Returns top customers with order count, total spent, and join date.
 */
router.get("/customers", async (req, res) => {
  try {
    const { from, to, limit = 20 } = req.query;

    const match = {
      event: { $in: ["user.created", "order.created", "payment.success"] }
    };

    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    const results = await Event.aggregate([
      { $match: match },
      {
        $facet: {
          // Capture when users were created
          users: [
            { $match: { event: "user.created" } },
            {
              $group: {
                _id: "$payload.userId",
                joinedAt: { $min: "$timestamp" }
              }
            }
          ],
          // Orders per user
          orders: [
            { $match: { event: "order.created" } },
            {
              $group: {
                _id: "$payload.userId",
                orderCount: { $sum: 1 }
              }
            }
          ],
          // Payments (successful)
          payments: [
            { $match: { event: "payment.success" } },
            {
              $group: {
                _id: "$payload.orderId",
                totalPaid: { $sum: { $toDouble: "$payload.amount" } }
              }
            }
          ]
        }
      }
    ]);

    const [facet] = results;

    // Merge users + orders + payments
    const userMap = {};

    // Base user list
    (facet.users || []).forEach((u) => {
      if (!u._id) return;
      userMap[u._id] = {
        userId: u._id,
        joinedAt: u.joinedAt,
        totalSpent: 0,
        orderCount: 0
      };
    });

    // Add order counts
    (facet.orders || []).forEach((o) => {
      if (!o._id) return;
      if (!userMap[o._id]) userMap[o._id] = { userId: o._id, totalSpent: 0, orderCount: 0 };
      userMap[o._id].orderCount = o.orderCount;
    });

    // Sum total spent — we’ll need to look up which user made the order
    // since payment.success has only orderId, not userId.
    // For that, we'll fetch related order.created docs.
    const paidOrders = await Event.find({
      event: "order.created",
      "payload.orderId": { $in: (facet.payments || []).map((p) => p._id) }
    });

    paidOrders.forEach((ord) => {
      const pay = facet.payments.find((p) => p._id === ord.payload.orderId);
      if (!ord.payload.userId || !pay) return;
      const uid = ord.payload.userId;
      if (!userMap[uid]) userMap[uid] = { userId: uid, totalSpent: 0, orderCount: 0 };
      userMap[uid].totalSpent += pay.totalPaid;
    });

    // Convert to array & sort
    const customers = Object.values(userMap)
      .map((c) => ({
        ...c,
        totalSpent: parseFloat(c.totalSpent.toFixed(2))
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, parseInt(limit));

    res.json(customers);
  } catch (err) {
    console.error("GET /analytics/customers error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
