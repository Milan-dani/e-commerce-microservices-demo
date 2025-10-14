/**
 * NATS publisher - publishes JSON messages to subjects.
 * Uses node-nats-streaming (STAN) for simple demo; switch to nats.js for native NATS.
 */

const nats = require("node-nats-streaming");
const NATS_CLUSTER_ID = process.env.NATS_CLUSTER_ID || "test-cluster";
const NATS_CLIENT_ID = process.env.NATS_CLIENT_ID || `payment-srv-${Date.now()}`;
const NATS_URL = process.env.NATS_URL || "nats://localhost:4222";

let stan;
let isConnected = false;

function connect() {
  return new Promise((resolve, reject) => {
    if (isConnected && stan) return resolve(stan);
    stan = nats.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, { url: NATS_URL });

    const onConnect = () => {
      isConnected = true;
      console.log("NATS (STAN) connected:", NATS_URL);
      resolve(stan);
    };

    stan.on("connect", onConnect);
    stan.on("error", (err) => {
      console.error("NATS error:", err);
      reject(err);
    });

    // reconnect / close handlers
    stan.on("close", () => {
      isConnected = false;
      console.warn("NATS connection closed");
    });
  });
}

/**
 * publishPaymentEvent(subject, payload)
 * subject: string (e.g., "payment.success")
 * payload: object
 */
async function publishPaymentEvent(subject, payload) {
  const client = await connect();
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    client.publish(subject, data, (err, guid) => {
      if (err) {
        console.error("NATS publish error:", err);
        return reject(err);
      }
      // guid can be used for tracking
      // console.log(`Published ${subject} - guid: ${guid}`);
      resolve(guid);
    });
  });
}

module.exports = { publishPaymentEvent };
