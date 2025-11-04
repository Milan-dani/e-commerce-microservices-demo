// routes/products.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/products
 * Returns product analytics summary (sales, views, revenue)
 */
router.get("/products", async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;

    const match = {};

    // Optional date filtering
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    // Relevant product-related events
    match.event = { $in: ["product.viewed", "order.created", "payment.success"] };

    // Fetch and aggregate
    const events = await Event.aggregate([
      { $match: match },
      {
        $facet: {
          views: [
            { $match: { event: "product.viewed" } },
            {
              $group: {
                _id: "$payload.productId",
                views: { $sum: 1 }
              }
            }
          ],
          orders: [
            { $match: { event: "order.created" } },
            { $unwind: "$payload.items" },
            {
              $group: {
                _id: "$payload.items.productId",
                orders: { $sum: 1 },
                revenue: { $sum: "$payload.items.price" }
              }
            }
          ],
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

    const [result] = events;

    const productMap = {};

    // Combine all data
    (result.views || []).forEach((v) => {
      if (!v._id) return;
      productMap[v._id] = { productId: v._id, views: v.views, orders: 0, revenue: 0 };
    });

    (result.orders || []).forEach((o) => {
      if (!o._id) return;
      if (!productMap[o._id]) productMap[o._id] = { productId: o._id, views: 0, orders: 0, revenue: 0 };
      productMap[o._id].orders += o.orders;
      productMap[o._id].revenue += o.revenue;
    });

    // Compute conversion rates
    const products = Object.values(productMap).map((p) => ({
      ...p,
      conversionRate:
        p.views > 0 ? ((p.orders / p.views) * 100).toFixed(2) : "0.00"
    }));

    // Sort by revenue (descending)
    const sorted = products.sort((a, b) => b.revenue - a.revenue).slice(0, parseInt(limit));

    res.json(sorted);
  } catch (err) {
    console.error("GET /analytics/products error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
