const nats = require("nats");
const { logInfo, logError } = require("./utils/logger");

let nc;
const codec = nats.JSONCodec();

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

async function connectNATS() {
  if (nc && !nc.isClosed()) return nc;

  try {
    nc = await nats.connect({ servers: NATS_URL });
    logInfo(`[Broker] Connected to NATS`);
    return nc;
  } catch (err) {
    logError("[Broker] Failed to connect to NATS", err);
    throw err;
  }
}

function getCodec() {
  return codec;
}

function getConnection() {
  if (!nc) throw new Error("NATS not connected");
  return nc;
}

module.exports = { connectNATS, getCodec, getConnection };
