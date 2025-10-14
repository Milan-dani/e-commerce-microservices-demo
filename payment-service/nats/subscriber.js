// example subscriber if payment-service needs to listen to events
const nats = require("node-nats-streaming");
const NATS_CLUSTER_ID = process.env.NATS_CLUSTER_ID || "test-cluster";
const NATS_CLIENT_ID = `payment-subscriber-${Date.now()}`;
const NATS_URL = process.env.NATS_URL || "nats://localhost:4222";

module.exports = function natsSubscriber() {
  const stan = nats.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, { url: NATS_URL });

  stan.on("connect", () => {
    console.log("payment-service subscriber connected to NATS");

    const sub = stan.subscribe("order.created");
    sub.on("message", (msg) => {
      const data = JSON.parse(msg.getData());
      console.log("Received order.created:", data);
      // Example: react to order created events (not necessary here)
    });
  });
};
