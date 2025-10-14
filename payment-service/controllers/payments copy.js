const { publishPaymentEvent } = require("../nats/publisher");
const uuid = require("uuid").v4;
const crypto = require("crypto");

/**
 * In-memory idempotency map for demo. Replace with Redis in prod.
 * key: idempotencyKey or transactionId
 * value: { result }
 */
const idempotencyCache = new Map();

/**
 * Simulated payment processing logic.
 * For production integrate with Stripe/PayPal/Razorpay etc.
 *
 * For testing deterministic behavior:
 *  - if cardToken contains "fail" -> fail
 *  - if cardToken contains "async" -> simulate asynchronous processing (respond pending, publish event after delay)
 *  - otherwise -> success
 */
async function processPaymentHandler(req, res) {
  const { orderId, amount, cardToken, userId, idempotencyKey } = req.body;

  if (!orderId || !amount || !cardToken) {
    return res.status(400).json({ success: false, reason: "orderId, amount and cardToken required" });
  }

  const key = idempotencyKey || `${orderId}:${cardToken}`;

  if (idempotencyCache.has(key)) {
    // Return cached result (idempotent)
    return res.status(200).json(idempotencyCache.get(key));
  }

  // Simulate processing
  const transactionId = `txn_${uuid().split("-")[0]}`;
  const now = Date.now();

  // deterministic behavior for testing
  if (String(cardToken).toLowerCase().includes("fail")) {
    const result = { success: false, transactionId, status: "failed", reason: "Card declined (simulated)" };
    idempotencyCache.set(key, result);
    // publish a payment.failed event so Order-Service can update asynchronously as well
    try {
      await publishPaymentEvent("payment.failed", { orderId, transactionId, amount, reason: result.reason, timestamp: now });
    } catch (e) {
      console.error("Failed to publish NATS event (failed):", e.message);
    }
    return res.status(200).json(result);
  }

  if (String(cardToken).toLowerCase().includes("async")) {
    // async processing: respond pending and publish success after delay
    const pendingResult = { success: true, transactionId, status: "pending", note: "Processing asynchronously" };
    idempotencyCache.set(key, pendingResult);

    // schedule async success/failure (for demo we make it succeed)
    setTimeout(async () => {
      const success = { success: true, transactionId, status: "paid" };
      idempotencyCache.set(key, success);
      try {
        await publishPaymentEvent("payment.success", { orderId, transactionId, amount, timestamp: Date.now() });
      } catch (e) {
        console.error("Failed to publish NATS event (async success):", e.message);
      }
    }, Number(process.env.ASYNC_PAYMENT_DELAY_MS || 3000));

    return res.status(202).json(pendingResult); // 202 Accepted
  }

  // default: success
  const success = { success: true, transactionId, status: "paid" };
  idempotencyCache.set(key, success);

  // publish payment.success
  try {
    await publishPaymentEvent("payment.success", { orderId, transactionId, amount, timestamp: now });
  } catch (e) {
    console.error("Failed to publish NATS event (success):", e.message);
  }

  return res.status(200).json(success);
}

/**
 * webhookHandler: receive webhook events from external payment gateway
 * Expect header: x-webhook-signature: HMAC_SHA256(payload, WEBHOOK_SECRET)
 *
 * Body example (gateway dependent):
 *  { event: "payment.succeeded", data: { orderId, transactionId, amount } }
 */
async function webhookHandler(req, res) {
  const signature = req.headers["x-webhook-signature"];
  const secret = process.env.WEBHOOK_SECRET || "webhook_secret_demo";
  const rawBody = JSON.stringify(req.body); // body-parser parsed it already

  // verify signature if header present
  if (signature) {
    const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (computed !== signature) {
      console.warn("Invalid webhook signature");
      return res.status(400).json({ success: false, reason: "Invalid signature" });
    }
  }

  const { event, data } = req.body;
  if (!event || !data) return res.status(400).json({ success: false, reason: "event and data required" });

  try {
    if (event === "payment.succeeded" || event === "payment.success") {
      await publishPaymentEvent("payment.success", data);
    } else if (event === "payment.failed") {
      await publishPaymentEvent("payment.failed", data);
    } else {
      // pass-through generic event name
      await publishPaymentEvent(event, data);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    return res.status(500).json({ success: false, reason: err.message });
  }
}

module.exports = { processPaymentHandler, webhookHandler };
