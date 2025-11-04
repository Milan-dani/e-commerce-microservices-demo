// routes/user.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/user/:userId
 * Returns analytics data for a specific user.
 *
 * Optional query params:
 *  - from (ISO date)
 *  - to (ISO date)
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId in params" });
    }

    const match = {
      "payload.userId": userId,
    };

    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    // 1️⃣ Fetch user order stats
    const orderStats = await Event.aggregate([
      { $match: { ...match, event: "order.created" } },
      {
        $group: {
          _id: "$payload.userId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$payload.total" },
          firstOrderDate: { $min: "$timestamp" },
          lastOrderDate: { $max: "$timestamp" },
        },
      },
    ]);

    // 2️⃣ Fetch payment success total
    const paymentStats = await Event.aggregate([
      { $match: { ...match, event: "payment.success" } },
      {
        $group: {
          _id: "$payload.userId",
          totalPaidAmount: { $sum: { $toDouble: "$payload.amount" } },
        },
      },
    ]);

    // 3️⃣ Fetch user engagement (views, cart adds)
    const engagementStats = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$payload.userId",
          views: {
            $sum: { $cond: [{ $eq: ["$event", "product.viewed"] }, 1, 0] },
          },
          cartAdds: {
            $sum: { $cond: [{ $eq: ["$event", "cart.item.added"] }, 1, 0] },
          },
          ordersCreated: {
            $sum: { $cond: [{ $eq: ["$event", "order.created"] }, 1, 0] },
          },
          paymentsSuccess: {
            $sum: { $cond: [{ $eq: ["$event", "payment.success"] }, 1, 0] },
          },
        },
      },
    ]);

    // 4️⃣ Get user.created event for join date
    const userCreated = await Event.findOne({
      event: "user.created",
      "payload.userId": userId,
    })
      .sort({ timestamp: 1 })
      .lean();

    const userInfo = {
      userId,
      memberSince: userCreated?.timestamp || null,
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalSpent: orderStats[0]?.totalSpent || 0,
      totalPaidAmount: paymentStats[0]?.totalPaidAmount || 0,
      averageOrderValue:
        orderStats[0]?.totalOrders > 0
          ? orderStats[0]?.totalSpent / orderStats[0]?.totalOrders
          : 0,
      firstOrderDate: orderStats[0]?.firstOrderDate || null,
      lastOrderDate: orderStats[0]?.lastOrderDate || null,
      engagement: engagementStats[0] || {
        views: 0,
        cartAdds: 0,
        ordersCreated: 0,
        paymentsSuccess: 0,
      },
    };

    res.json(userInfo);
  } catch (err) {
    console.error("GET /analytics/user/:userId error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
});

module.exports = router;
