const { connect, StringCodec, consumerOpts } = require("nats");

const sc = StringCodec();
let nc, js, jsm;

async function connectNats() {
  if (nc && !nc.isClosed()) return { nc, js, jsm };

  nc = await connect({
    servers: process.env.NATS_URL || "nats://localhost:4222",
    name: process.env.SERVICE_NAME || "payments-service",
    reconnect: true,
    maxReconnectAttempts: -1,
  });

  js = nc.jetstream();
  jsm = await nc.jetstreamManager();
  console.log(`[NATS] Connected: ${process.env.SERVICE_NAME}`);
  return { nc, js, jsm };
}

async function ensureStream(streamName, subjects) {
  const { jsm } = await connectNats();
  try {
    await jsm.streams.info(streamName);
  } catch {
    await jsm.streams.add({ name: streamName, subjects, storage: "file" });
    console.log(`[NATS] Created stream: ${streamName}`);
  }
}

async function publishEvent(subject, payload, opts = { jetstream: true }) {
  const { js, nc } = await connectNats();
  const data = sc.encode(JSON.stringify(payload));

  if (opts.jetstream && js) {
    await js.publish(subject, data);
  } else {
    nc.publish(subject, data);
  }
  console.log(`📤 Event published: ${subject}`);
}

async function subscribeEvent(subject, handler, opts = {}) {
  const { js, nc } = await connectNats();

  if (opts.jetstream) {
    const copts = consumerOpts();
    copts.deliverTo(`${process.env.SERVICE_NAME}-${subject}-deliver`);
    copts.durable(`${process.env.SERVICE_NAME}-${subject}-durable`);
    copts.ackExplicit();
    copts.filterSubject(subject);

    const sub = await js.subscribe(subject, copts);
    console.log(`📥 Subscribed (JetStream): ${subject}`);

    (async () => {
      for await (const m of sub) {
        try {
          const data = JSON.parse(sc.decode(m.data));
          await handler(data, m);
          m.ack();
        } catch (err) {
          console.error(`[NATS] Handler failed for ${subject}:`, err.message);
          m.nak();
        }
      }
    })();
  } else {
    const sub = nc.subscribe(subject);
    console.log(`📥 Subscribed: ${subject}`);
    (async () => {
      for await (const m of sub) {
        const data = JSON.parse(sc.decode(m.data));
        await handler(data);
      }
    })();
  }
}

module.exports = { connectNats, ensureStream, publishEvent, subscribeEvent };