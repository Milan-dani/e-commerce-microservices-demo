require("dotenv").config();
const express = require('express');
// const registerService = require("../cart-service/serviceRegistry/registerService");
const { processPaymentHandler, webhookHandler } = require("./controllers/payments");
const { getNats } = require("./nats/publisher");
const redis = require("./utils/redisClient");
const { registerService, justConnectNATS, setupEventSubscriptions } = require("./subscriber");
const { drainOutbox, emit } = require("./utils/eventEmitter");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3005;
const SERVICE_NAME = process.env.SERVICE_NAME || "payments";

// Dynamic registration
// registerService(SERVICE_NAME, PORT);


// Health endpoint for Consul
app.get("/health", (req, res) => res.json({ status: "ok" }));



/**
 * POST /payments/process
 * Body:
 *  {
 *    orderId: "order_123",
 *    amount: 100.50,
 *    cardToken: "tok_abc",
 *    userId: "user_1",
 *    idempotencyKey: "unique-key-xyz"   // optional but recommended
 *  }
 *
 * Response: { success: true/false, transactionId, status, reason? }
 */
app.post("/process", processPaymentHandler);

/**
 * POST /payments/webhook
 * Generic webhook receiver (e.g., from a real payment gateway)
 * Expects signature header: `x-webhook-signature`
 */
// app.post("/webhook", webhookHandler);

app.post('/processX', async (req, res) => {
  const { orderId, amount } = req.body;
  await emit("payment.success", {
    orderId,
   
    amount,
  });
  res.json({ status: 'success', orderId });
})

// Simulate payment processing
app.post('/payments/process', (req, res) => {
  const { orderId, amount } = req.body;
  // Simulate random approval/decline
  const success = Math.random() > 0.2;
  if (success) {
    // TODO: Publish payment.success event
    res.json({ status: 'success', orderId });
  } else {
    // TODO: Publish payment.failed event
    res.json({ status: 'failed', orderId });
  }
});

// // optional: start any subscribers/listeners (if this service needs to subscribe)
// if (process.env.NATS_SUBSCRIBE === "true") {
//   natsSubscriber();
// }
// // connect to nats early
// getNats().catch(err => {
//   console.error("NATS connect error:", err);
// });

app.listen(PORT, async() => {
  console.log(`Payment Service running on port ${PORT}`);
  await registerService().then(justConnectNATS);
  await drainOutbox();
  // await setupEventSubscriptions();
});
