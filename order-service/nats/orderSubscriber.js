// nats/orderSubscriber.js
const { connect, StringCodec } = require("nats");
const Order = require("../models/Order");

const sc = StringCodec();

let nc;
async function startSubscriber() {
  const NATS_URL = process.env.NATS_URL || "nats://nats:4222";
  const clientName = process.env.NATS_CLIENT_ID || `order-subscriber-${Date.now()}`;

  nc = await connect({ servers: NATS_URL, name: clientName });
  console.log("Order-Service connected to NATS:", NATS_URL);

  // create JetStream context
  const js = nc.jetstream();

  // durable pull consumer settings: we'll use simple subscribe() which creates an ephemeral consumer by default.
  // For production, create durable consumers with specific consumer configs.
  const subSuccess = await nc.subscribe("payment.success", { queue: "order-service-queue" });
  (async () => {
    for await (const m of subSuccess) {
      try {
        const payload = JSON.parse(sc.decode(m.data));
        const { orderId, transactionId } = payload;
        console.log("NATS payment.success received:", payload);

        const order = await Order.findOne({ where: { id: orderId } });
        if (!order) {
          console.warn("Order not found for payment.success event", orderId);
          m.ack && m.ack();
          continue;
        }

        order.paymentInfo = { ...order.paymentInfo, status: "paid", transactionId };
        order.status = "paid";
        await order.save();
        m.ack && m.ack();
      } catch (err) {
        console.error("Error handling payment.success:", err);
      }
    }
  })();

  const subFailed = await nc.subscribe("payment.failed", { queue: "order-service-queue" });
  (async () => {
    for await (const m of subFailed) {
      try {
        const payload = JSON.parse(sc.decode(m.data));
        const { orderId, reason } = payload;
        console.log("NATS payment.failed received:", payload);

        const order = await Order.findOne({ where: { id: orderId } });
        if (!order) {
          console.warn("Order not found for payment.failed event", orderId);
          m.ack && m.ack();
          continue;
        }

        order.paymentInfo = { ...order.paymentInfo, status: "failed", reason };
        order.status = "pending";
        await order.save();
        m.ack && m.ack();
      } catch (err) {
        console.error("Error handling payment.failed:", err);
      }
    }
  })();
}

module.exports = { startSubscriber };
