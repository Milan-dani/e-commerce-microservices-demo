// const { connectNATS, getCodec } = require("../message-broker/natsConnection");
const Order = require("./models/Order");
const registerServiceConsul = require("./serviceRegistry/registerService");
const { emit } = require("./utils/eventEmitter");
const {
  connectNats,
  ensureStream,
  subscribeEvent,
} = require("./utils/natsClient");

const PORT = process.env.PORT || 3004;
const CONSUL_URL = process.env.LOCAL_CONSUL_URL || "http://localhost:8500";
const MESSAGE_BROKER_URL =
  process.env.MESSAGE_BROKER_URL || "http://localhost:3009";
const SERVICE_NAME = process.env.SERVICE_NAME || "orders";

// const SERVICE_NAME = "analytics-service";
const STREAM = "ECOM_EVENTS";
const SUBSCRIBED_TOPICS = [
  "order.created",
  "order.updated",
  "order.completed",
  "order.paid",
  "order.status.updated",
  "payment.success",
  "payment.failed",
];

// Helper: perform a JSON POST request using fetch
async function postJSON(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json().catch(() => ({})); // Handle empty response bodies
}

// Register service and events in Consul and Broker
async function registerService() {
  try {
    await registerServiceConsul(SERVICE_NAME, PORT);
    // Register service in local-consul
    // await postJSON(`${CONSUL_URL}/register`, {
    //   name: SERVICE_NAME,
    //   url: process.env.SERVICE_URL || "http://localhost:9300",
    // });

    // Register event topics in local-consul
    await postJSON(`${CONSUL_URL}/register-events`, {
      service: SERVICE_NAME,
      topics: SUBSCRIBED_TOPICS,
    });

    // Register subscriber in Message Broker
    await postJSON(`${MESSAGE_BROKER_URL}/register-subscriber`, {
      service: SERVICE_NAME,
      topics: SUBSCRIBED_TOPICS,
    });

    console.log(`✅ Registered ${SERVICE_NAME} with broker and consul`);
  } catch (err) {
    console.error("❌ Registration failed:", err.message);
  }
}

// Start listening to NATS topics
async function startListening_Old() {
  const nc = await connectNATS();
  const codec = getCodec();

  for (const subject of SUBSCRIBED_TOPICS) {
    const sub = nc.subscribe(subject);
    console.log(`📡 Subscribed to event: ${subject}`);

    (async () => {
      for await (const msg of sub) {
        const data = codec.decode(msg.data);
        console.log(`📥 [${subject}] Event received:`, data);

        await Event.create({
          event: subject,
          source: data.source || "unknown",
          payload: data,
        });
      }
    })();
  }
}

async function startListening() {
  await connectNats();
  await ensureStream(STREAM, SUBSCRIBED_TOPICS);

  for (const topic of SUBSCRIBED_TOPICS) {
    await subscribeEvent(
      topic,
      async (data) => {
        // await Event.create({
        //   event: topic,
        //   source: data.source || "unknown",
        //   payload: data,
        //   timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        // });
        // console.log(`📊 Analytics saved event: ${topic}`);
        console.log(`topic: ${topic} | data: ${data}`);
      },
      { jetstream: true }
    );
  }
}

// function to only connect with NATS, but not subscribe to any topic
async function justConnectNATS() {
  await connectNats();
  await ensureStream(STREAM, SUBSCRIBED_TOPICS);
}

// function to recieve and process events
async function setupEventSubscriptions() {
  await subscribeEvent(
    "payment.success",
    async (data) => {
      console.log(`✅ Payment successful for Order ${data.orderId}`);

      try {
        // await updateOrderPaymentStatus(data.orderId, "PAID");
        //  await Order.update(
        //   {
        //     paymentStatus: 'paid',
        //     paymentFailureReason: data?.reason,
        //     updatedAt: new Date(),
        //   },
        //   {
        //     where: { id: data.orderId },
        //   }
        // );
        const order = await Order.findByPk(data.orderId);
        if (order && order.status !== "paid") {
          order.status = "paid";
          order.paymentInfo.status = "paid";
          order.paymentInfo.transactionId = data.transactionId;
          await order.save();
        }
      } catch (err) {
        console.error(
          `Failed to update payment status for ${data.orderId}:`,
          err
        );
      }

      // await emit("order.completed", {
      //   orderId: data.orderId,
      //   timestamp: new Date().toISOString(),
      // });
      await emit("order.paid", {
        orderId: data.orderId,
        timestamp: new Date().toISOString(),
      });
    },
    { jetstream: true }
  );

  await subscribeEvent(
    "payment.failed",
    async (data) => {
      console.log(`❌ Payment failed for Order ${data.orderId}`);
      // Update DB
      try {
        // await updateOrderPaymentStatus(data.orderId, "PAYMENT_FAILED", data.reason);
        // await Order.update(
        //   {
        //     paymentStatus: 'failed',
        //     paymentFailureReason: data?.reason,
        //     updatedAt: new Date(),
        //   },
        //   {
        //     where: { id: data.orderId },
        //   }
        // );
        const order = await Order.findByPk(data.orderId);
        if (order && order.status !== "paid") {
          order.status = "failed";
          order.paymentInfo.status = "failed";
          order.paymentInfo.reason = data.reason;
          await order.save();
        }
      } catch (err) {
        console.error(
          `Failed to update payment status for ${data.orderId}:`,
          err
        );
      }

      await emit("order.status.updated", {
        orderId: data.orderId,
        status: "PAYMENT_FAILED",
        reason: data.reason,
      });
    },
    { jetstream: true }
  );
}

module.exports = {
  registerService,
  startListening,
  justConnectNATS,
  setupEventSubscriptions,
};
