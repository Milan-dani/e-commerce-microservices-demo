// controllers/payments.js
const { emit } = require("../utils/eventEmitter");
const redis = require("../utils/redisClient");
const uuid = require("uuid").v4;
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const IDEMPOTENCY_TTL = Number(process.env.IDEMPOTENCY_TTL_SEC || 24 * 3600);

async function processPaymentHandler(req, res) {
  const { orderId, amount, userId, paymentMethodId, idempotencyKey } = req.body;

  if (!orderId || !amount || !paymentMethodId)
    return res.status(400).json({ success: false, reason: "orderId, amount, and paymentMethodId required" });

  // const key = `idempotency:${idempotencyKey || `${orderId}:${paymentMethodId}`}`;
  const key = `idempotency:idempotency:${orderId}${orderId}:${paymentMethodId}:${Date.now()}`; // unique key everytime for testing
  
  console.log("[Stripe] Processing payment for", orderId, "using", paymentMethodId);

  try {
    const cached = await redis.get(key);
    // if (cached) return res.status(200).json(JSON.parse(cached));

    const transactionId = `txn_${uuid().split("-")[0]}`;
    const now = Date.now();

    // Create & confirm PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount * 100),
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        payment_method_types: ["card"], // ✅ Only allow card payments
        metadata: { orderId, userId, transactionId },
      },
      { idempotencyKey: key }
    );

    let result;

    if (paymentIntent.status === "succeeded") {
      result = { success: true, transactionId, stripeId: paymentIntent.id, status: "paid" };
      await emit("payment.success", {
        orderId,
        transactionId,
        stripeId: paymentIntent.id,
        amount,
        timestamp: now,
      });
    } 
    else if (paymentIntent.status === "requires_action" || paymentIntent.status === "processing") {
      return res.status(400).json({
        success: false,
        reason: "Payment requires additional authentication",
        client_secret: paymentIntent.client_secret,
      });
    } 
    else {
      result = {
        success: false,
        transactionId,
        stripeId: paymentIntent.id,
        status: paymentIntent.status,
        reason: paymentIntent.last_payment_error?.message || "Payment not completed",
      };
      await emit("payment.failed", {
        orderId,
        transactionId,
        amount,
        reason: result.reason,
        timestamp: now,
      });
    }

    await redis.set(key, JSON.stringify(result), "EX", IDEMPOTENCY_TTL);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Stripe payment error:", err);

    const reason =
      err.type === "StripeCardError"
        ? err.message
        : err.raw?.message || err.message;

    const failResult = {
      success: false,
      status: "failed",
      reason,
    };

    await redis.set(key, JSON.stringify(failResult), "EX", IDEMPOTENCY_TTL);
    await emit("payment.failed", {
      orderId,
      amount,
      reason,
      timestamp: Date.now(),
    });

    return res.status(400).json(failResult); // ✅ 400 means "client error" (bad card, etc.)
  }
}


async function processPaymentHandler_OLD(req, res) {
  const { orderId, amount, userId, paymentMethodId, idempotencyKey } = req.body;

  if (!orderId || !amount || !paymentMethodId)
    return res.status(400).json({ success: false, reason: "orderId, amount, and paymentMethodId required" });

  const key = `idempotency:${idempotencyKey || `${orderId}:${paymentMethodId}`}`;
  console.log("[Stripe] Processing payment for", orderId, "using", paymentMethodId);

  try {
    const cached = await redis.get(key);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const transactionId = `txn_${uuid().split("-")[0]}`;
    const now = Date.now();

    // 🔹 Create & confirm PaymentIntent using existing payment method
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount * 100),
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        metadata: { orderId, userId, transactionId },
        payment_method_types: ["card"], // 🔹 only accept cards
      },
      { idempotencyKey: key }
    );
    // automatic_payment_methods: {
    //   enabled: true,
    //   allow_redirects: "never",
    // },
    // console.log(paymentIntent, paymentMethodId);
    

    let result;

    if (paymentIntent.status === "succeeded") {
      result = { success: true, transactionId, stripeId: paymentIntent.id, status: "paid" };
      await emit("payment.success", {
        orderId,
        transactionId,
        amount,
        stripeId: paymentIntent.id,
        timestamp: now,
      });
    } 
    else if (paymentIntent.status === "requires_action" || paymentIntent.status === "processing") {
      // Payment needs 3DS authentication, etc.
      return res.status(400).json({
        success: false,
        reason: "Payment requires additional authentication",
        client_secret: paymentIntent.client_secret,
      });
    }
    else {
      result = {
        success: false,
        transactionId,
        status: paymentIntent.status,
        reason: paymentIntent.last_payment_error?.message || "Payment not completed",
      };
      await emit("payment.failed", {
        orderId,
        transactionId,
        amount,
        reason: result.reason,
        timestamp: now,
      });
    }

    await redis.set(key, JSON.stringify(result), "EX", IDEMPOTENCY_TTL);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Stripe payment error:", err);
     // Stripe-specific error response
     const reason =
     err.type === "StripeCardError"
       ? err.message
       : err.raw?.message || err.message;
    const failResult = {
      success: false,
      status: "failed",
      reason: reason,
    };

    await redis.set(key, JSON.stringify(failResult), "EX", IDEMPOTENCY_TTL);
    await emit("payment.failed", {
      orderId,
      amount,
      reason: reason,
      timestamp: Date.now(),
    });

    return res.status(500).json(failResult);
  }
}

module.exports = { processPaymentHandler };
