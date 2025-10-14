// controllers/payments.js

const { publishEvent } = require("../nats/publisher");
const redis = require("../utils/redisClient");
const uuid = require("uuid").v4;


/**
 * Idempotency storage in Redis.
 * Key: "idempotency:{key}"
 * Value: JSON stringified result { success, transactionId, status, reason }
 * TTL: optional (e.g., 24h)
 */
const IDEMPOTENCY_TTL = Number(process.env.IDEMPOTENCY_TTL_SEC || 24 * 3600);

async function processPaymentHandler(req, res) {
  const { orderId, amount, cardToken, userId, idempotencyKey } = req.body;
  if (!orderId || !amount || !cardToken) return res.status(400).json({ success: false, reason: "orderId, amount and cardToken required" });

  const key = `idempotency:${idempotencyKey || `${orderId}:${cardToken}`}`;

  try {
    // check redis
    const cached = await redis.get(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json(parsed);
    }

    const transactionId = `txn_${uuid().split("-")[0]}`;
    const now = Date.now();

    // deterministic behavior for testing
    if (String(cardToken).toLowerCase().includes("fail")) {
      const result = { success: false, transactionId, status: "failed", reason: "Card declined (simulated)" };
      await redis.set(key, JSON.stringify(result), "EX", IDEMPOTENCY_TTL);
      // publish failed event
      await publishEvent("payment.failed", { orderId, transactionId, amount, reason: result.reason, timestamp: now });
      return res.status(200).json(result);
    }

    if (String(cardToken).toLowerCase().includes("async")) {
      const pendingResult = { success: true, transactionId, status: "pending", note: "Processing asynchronously" };
      await redis.set(key, JSON.stringify(pendingResult), "EX", IDEMPOTENCY_TTL);

      // simulate async processing -> success later
      setTimeout(async () => {
        const success = { success: true, transactionId, status: "paid" };
        await redis.set(key, JSON.stringify(success), "EX", IDEMPOTENCY_TTL);
        try {
          await publishEvent("payment.success", { orderId, transactionId, amount, timestamp: Date.now() });
        } catch (err) {
          console.error("Failed to publish async payment.success", err);
        }
      }, Number(process.env.ASYNC_PAYMENT_DELAY_MS || 3000));

      return res.status(202).json(pendingResult);
    }

    // default immediate success
    const success = { success: true, transactionId, status: "paid" };
    await redis.set(key, JSON.stringify(success), "EX", IDEMPOTENCY_TTL);
    await publishEvent("payment.success", { orderId, transactionId, amount, timestamp: now });

    return res.status(200).json(success);
  } catch (err) {
    console.error("Payment processing error:", err);
    return res.status(500).json({ success: false, reason: err.message });
  }
}

async function webhookHandler(req, res) {
  const signature = req.headers["x-webhook-signature"];
  const secret = process.env.WEBHOOK_SECRET || "webhook_secret_demo";
  const payload = req.body;
  // signature check omitted for brevity — implement HMAC verify as earlier
  const { event, data } = payload;
  if (!event || !data) return res.status(400).json({ success: false, reason: "event/data required" });

  try {
    if (event === "payment.succeeded" || event === "payment.success") {
      await publishEvent("payment.success", data);
    } else if (event === "payment.failed") {
      await publishEvent("payment.failed", data);
    } else {
      await publishEvent(event, data);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Webhook publish error:", err);
    return res.status(500).json({ success: false, reason: err.message });
  }
}

module.exports = { processPaymentHandler, webhookHandler };
