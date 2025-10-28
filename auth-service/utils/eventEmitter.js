const { publishEvent } = require("./natsClient");
const fs = require("fs");
const path = require("path");

const OUTBOX_FILE = path.join(process.cwd(), "outbox.json");
const SERVICE_NAME = process.env.SERVICE_NAME || "orders";

function readOutbox() {
  if (!fs.existsSync(OUTBOX_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(OUTBOX_FILE));
  } catch {
    return [];
  }
}

function writeOutbox(list) {

  fs.writeFileSync(OUTBOX_FILE, JSON.stringify(list, null, 2));
}

async function emit(subject, payload, opts = { jetstream: true, retries: 3 }) {
  // console.log("in Order Emiter");

  const enrichedPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
    source: SERVICE_NAME,
  };


  let attempts = 0;
  while (attempts < opts.retries) {
    try {
      // const enrichedPayload = {
      //   ...payload,
      //   timestamp: new Date().toISOString(),
      //   source: SERVICE_NAME,
      // };
      // await publishEvent(subject, payload, opts);
      await publishEvent(subject, enrichedPayload, opts);
      return;
    } catch (err) {
      attempts++;
      console.warn(
        `⚠️ Publish failed (${attempts}) for ${subject}`,
        err.message
      );
      await new Promise((r) => setTimeout(r, 500 * attempts));
    }
  }
  const list = readOutbox();
  // list.push({ subject, payload });
  list.push({ subject, enrichedPayload });
  
  writeOutbox(list);
  console.log(`📦 Saved to outbox: ${subject}`);
}

// async function drainOutbox() {
//   const list = readOutbox();
//   if (!list.length) return;
//   console.log(`🚚 Draining ${list.length} outbox events...`);
//   const remaining = [];
//   for (const e of list) {
//     try {
//       await publishEvent(e.subject, e.payload);
//     } catch (err) {
//       remaining.push(e);
//     }
//   }
//   writeOutbox(remaining);
// }
async function drainOutbox() {
  const list = readOutbox();
  if (!list.length) return;
  console.log(`🚚 Draining ${list.length} outbox events...`);
  const remaining = [];

  for (const e of list) {
    try {
      await publishEvent(e.subject, e.payload);
      console.log(`✅ Published from outbox: ${e.subject}`);
    } catch (err) {
      console.error(`❌ Failed to publish ${e.subject}:`, err.message);
      remaining.push(e);
    }
  }

  // only rewrite file if something changed
  if (remaining.length !== list.length) {
    writeOutbox(remaining);
    console.log(`📦 Outbox updated: ${remaining.length} events remaining`);
  }
}


module.exports = { emit, drainOutbox };
