// routes/events.js
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

/**
 * GET /analytics/events
 * Fetch raw event logs with filtering and pagination.
 *
 * Query params:
 *  - event (string)
 *  - userId (string)
 *  - from (ISO date)
 *  - to (ISO date)
 *  - limit (number, default 20)
 *  - page (number, default 1)
 */
router.get("/events", async (req, res) => {
  try {
    const { event, userId, from, to, limit = 20, page = 1 } = req.query;

    const query = {};

    // 🔹 Filter by event name
    if (event) {
      query.event = event;
    }

    // 🔹 Filter by userId in payload
    if (userId) {
      query["payload.userId"] = userId;
    }

    // 🔹 Filter by date range
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    // 🔹 Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 🔹 Fetch total count
    const total = await Event.countDocuments(query);

    // 🔹 Fetch data (sorted newest first)
    const events = await Event.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: events,
    });
  } catch (err) {
    console.error("GET /analytics/events error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
});

module.exports = router;
