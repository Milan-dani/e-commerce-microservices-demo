// routes/analytics.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/events
 * Filters: source, event, from, to, userId, productId, page, limit, sort
 */
router.get("/events", async (req, res) => {
  try {
    const {
      source,
      event,
      from,
      to,
      userId,
      productId,
      page = 1,
      limit = 50,
      sort = "desc"
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(1000, Math.max(1, parseInt(limit) || 50));

    const filter = {};

    if (source) filter.source = source;
    if (event) filter.event = event;

    // Date range
    if (from || to) {
      filter.timestamp = {};
      if (from) {
        const d = new Date(from);
        if (!isNaN(d)) filter.timestamp.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        if (!isNaN(d)) filter.timestamp.$lte = d;
      }
      if (Object.keys(filter.timestamp).length === 0) delete filter.timestamp;
    }

    if (userId) filter["payload.userId"] = userId;

    if (productId) {
      filter.$or = [
        { "payload.productId": productId },
        { "payload.items.productId": productId }
      ];
    }

    const sortObj = { timestamp: sort === "asc" ? 1 : -1 };

    const total = await Event.countDocuments(filter);

    const events = await Event.find(filter)
      .sort(sortObj)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      meta: {
        total,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(total / pageSize)
      },
      data: events
    });
  } catch (err) {
    console.error("GET /analytics/events error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
