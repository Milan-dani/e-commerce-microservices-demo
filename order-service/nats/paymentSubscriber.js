// nats/paymentSubscriber.js
import nats from "node-nats-streaming";
import Order from "../models/Order";

const NATS_CLUSTER_ID = process.env.NATS_CLUSTER_ID || "test-cluster";
const NATS_CLIENT_ID = "order-service-" + Date.now();
const NATS_URL = process.env.NATS_URL || "nats://localhost:4222";

const stan = nats.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, { url: NATS_URL });

stan.on("connect", () => {
  console.log("Connected to NATS");

  // Payment success
  const successSubscription = stan.subscribe("payment.success");
  successSubscription.on("message", async (msg) => {
    const data = JSON.parse(msg.getData());
    console.log("Payment success event received", data);

    const { orderId, transactionId } = data;
    const order = await Order.findOne({ where: { id: orderId } });
    if (order) {
      order.status = "paid";
      order.paymentInfo = { ...order.paymentInfo, status: "paid", transactionId };
      await order.save();
    }
  });

  // Payment failure
  const failedSubscription = stan.subscribe("payment.failed");
  failedSubscription.on("message", async (msg) => {
    const data = JSON.parse(msg.getData());
    console.log("Payment failed event received", data);

    const { orderId, reason } = data;
    const order = await Order.findOne({ where: { id: orderId } });
    if (order) {
      order.status = "pending";
      order.paymentInfo = { ...order.paymentInfo, status: "failed", reason };
      await order.save();
    }
  });
});
