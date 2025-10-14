// nats/publisher.js

// const { connect , StringCodec} = require("node-nats-streaming");

const { connect, StringCodec } = require("nats");
const sc = StringCodec();

let nc;
async function getNats() {
  if (nc) return nc;
  const NATS_URL = process.env.NATS_URL || "nats://nats:4222";
  nc = await connect({ servers: NATS_URL, name: process.env.NATS_CLIENT_ID || `payment-pub-${Date.now()}` });
  console.log("Payment-Service connected to NATS:", NATS_URL);
  return nc;
}

/**
 * publishEvent(subject, payload)
 * Uses plain NATS publish (works with JetStream server). For JetStream persistence, we can use js.publish
 */
async function publishEvent(subject, payload) {
  const n = await getNats();
  const js = n.jetstream();
  const jsm = await n.jetstreamManager(); // optional for stream management
  // ensure stream exists? assume stream 'payments' exists or is managed by infra.

  // For simplicity publish to subject directly using js.publish
  const data = sc.encode(JSON.stringify(payload));
  try {
    await js.publish(subject, data); // JetStream publish
    return true;
  } catch (err) {
    console.error("JetStream publish failed", err);
    // fallback to basic publish
    try {
      n.publish(subject, data);
      return true;
    } catch (e2) {
      console.error("NATS publish fallback failed", e2);
      throw e2;
    }
  }
}

module.exports = { publishEvent, getNats };
