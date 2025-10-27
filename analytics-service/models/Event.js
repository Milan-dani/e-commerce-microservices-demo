// const mongoose = require("mongoose");

// const eventSchema = new mongoose.Schema({
//   event: String,
//   source: String,
//   payload: Object,
//   timestamp: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Event", eventSchema);


const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event: { type: String, index: true },
  source: String,
  payload: Object,
  userId: { type: String, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  day: { type: String, index: true }, // YYYY-MM-DD for daily grouping
});

eventSchema.pre("save", function (next) {
  const date = new Date(this.timestamp);
  this.day = date.toISOString().split("T")[0];
  next();
});

module.exports = mongoose.model("Event", eventSchema);
