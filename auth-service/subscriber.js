const registerServiceConsul = require("./serviceRegistry/registerService");
const { emit } = require("./utils/eventEmitter");
const {
  connectNats,
  ensureStream,
  subscribeEvent,
} = require("./utils/natsClient");

const PORT = process.env.PORT || 3001;
const CONSUL_URL = process.env.LOCAL_CONSUL_URL || "http://localhost:8500";
const MESSAGE_BROKER_URL =
  process.env.MESSAGE_BROKER_URL || "http://localhost:3009";
const SERVICE_NAME = process.env.SERVICE_NAME || "auth";

const STREAM = "ECOM_EVENTS";
const SUBSCRIBED_TOPICS = ["user.created"];

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

module.exports = {
  registerService,
  startListening,
  justConnectNATS,
};
