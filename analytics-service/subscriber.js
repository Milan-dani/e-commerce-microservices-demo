// const { connectNATS, getCodec } = require("../message-broker/natsConnection");
const Event = require("./models/Event");
const registerServiceConsul = require("./serviceRegistry/registerService");
const { connectNats, ensureStream, subscribeEvent } = require("./utils/natsClient");

const PORT = process.env.PORT || 3008;
const CONSUL_URL = process.env.LOCAL_CONSUL_URL || "http://localhost:8500";
const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL || "http://localhost:3009";
const SERVICE_NAME = process.env.SERVICE_NAME || "analytics";

// const SERVICE_NAME = "analytics-service";
const STREAM = "ECOM_EVENTS";
const SUBSCRIBED_TOPICS = [
  "order.created",
  "order.placed",
  "order.paid", //
  "payment.success",
  "payment.failed", //
  "product.viewed",
  "product.added_to_cart",
  // "user.signup",
  // "user.login",
  "user.created",
];
// const SUBSCRIBED_TOPICS = [
//   "order.*",
//   "payment.*",
//   "product.*",
//   "user.*",
// ]

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

async function startListening (){
  await connectNats();

  // Ensure stream exists, retry if NATS is not ready yet
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensureStream(STREAM, SUBSCRIBED_TOPICS);
      console.log(`[NATS] Stream ready: ${STREAM}`);
      break;
    } catch (err) {
      console.error(`[NATS] Failed to ensure stream (attempt ${attempt}):`, err.message);
      if (attempt === maxRetries) throw err;
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }

  // await ensureStream(STREAM, SUBSCRIBED_TOPICS);

  for (const topic of SUBSCRIBED_TOPICS) {
    await subscribeEvent(topic, async (data) => {
      
      try {
        await Event.create({
          event: topic,
          source: data.source || "unknown",
          payload: data,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        });
        console.log(`📊 Analytics saved event: ${topic}`);
        
      } catch (error) {
        console.log(`❌ Analytics couldn't save event: ${topic}`);
      }
    }, { jetstream: true });
  }
}

module.exports = { registerService, startListening };
