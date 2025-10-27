const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3008;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/analytics';

// Event schema
const eventSchema = new mongoose.Schema({
  type: String,
  payload: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});
const Event = mongoose.model('Event', eventSchema);

// Metric schema (for dashboards)
const metricSchema = new mongoose.Schema({
  name: String,
  value: Number,
  updated: { type: Date, default: Date.now }
});
const Metric = mongoose.model('Metric', metricSchema);

// Ingest event
app.post('/events', async (req, res) => {
  const { type, payload } = req.body;
  const event = await Event.create({ type, payload });
  // TODO: Update metrics based on event type
  res.json(event);
});

// Get metrics
app.get('/metrics', async (req, res) => {
  const metrics = await Metric.find();
  res.json(metrics);
});

// Get events
app.get('/events', async (req, res) => {
  const events = await Event.find().sort({ timestamp: -1 }).limit(100);
  res.json(events);
});

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Analytics Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
