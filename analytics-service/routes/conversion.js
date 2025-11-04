// routes/conversion.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/conversion
 * Returns conversion funnel data: viewed -> added -> ordered -> paid
 */
router.get("/conversion", async (req, res) => {
  try {
    const { from, to, source } = req.query;

    const match = {};

    // Optional filters
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    if (source) match.source = source;

    // Only relevant events
    match.event = {
      $in: ["product.viewed", "cart.added", "order.placed", "payment.success"]
    };

    const stats = await Event.aggregate([
      { $match: match },
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);

    // Initialize structure
    const funnel = {
      viewed: 0,
      addedToCart: 0,
      ordered: 0,
      paid: 0
    };

    stats.forEach((s) => {
      switch (s._id) {
        case "product.viewed":
          funnel.viewed = s.count;
          break;
        case "cart.added":
          funnel.addedToCart = s.count;
          break;
        case "order.placed":
          funnel.ordered = s.count;
          break;
        case "payment.success":
          funnel.paid = s.count;
          break;
      }
    });

    // Conversion rates
    const conversionRates = {
      viewToAdd:
        funnel.viewed > 0
          ? ((funnel.addedToCart / funnel.viewed) * 100).toFixed(2)
          : "0.00",
      addToOrder:
        funnel.addedToCart > 0
          ? ((funnel.ordered / funnel.addedToCart) * 100).toFixed(2)
          : "0.00",
      orderToPaid:
        funnel.ordered > 0
          ? ((funnel.paid / funnel.ordered) * 100).toFixed(2)
          : "0.00",
      totalConversion:
        funnel.viewed > 0
          ? ((funnel.paid / funnel.viewed) * 100).toFixed(2)
          : "0.00"
    };

    res.json({
      funnel,
      conversionRates
    });
  } catch (err) {
    console.error("GET /analytics/conversion error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
