// // Node (CommonJS). Works with nats >= v2
// const { connect, StringCodec, consumerOpts, AckPolicy } = require("nats");

// const sc = StringCodec();
// let nc;
// let jsm; // JetStream Manager
// let js;  // JetStream client

// async function connectNats() {
//   if (nc && !nc.isClosed()) return { nc, js, jsm };

//   nc = await connect({
//     servers: process.env.NATS_URL || "nats://localhost:4222",
//     name: process.env.SERVICE_NAME || "message-broker-service",
//     reconnect: true,
//     maxReconnectAttempts: -1
//   });

//   // JetStream context
//   js = nc.jetstream();
//   jsm = await nc.jetstreamManager?.(); // optional in some versions - fallback safe
//   console.log("[NATS] connected");
//   return { nc, js, jsm };
// }

// // Ensure stream exists (idempotent)
// async function ensureStream(streamName, subjects = []) {
//   await connectNats();
//   try {
//     if (jsm) {
//       // Use jsm if available
//       await jsm.streams.info(streamName);
//     } else {
//       // try create via js - graceful fallback
//     }
//   } catch (err) {
//     // create stream
//     const conf = {
//       name: streamName,
//       subjects,
//       retention: "limits",
//       storage: "file",
//       max_messages: -1,
//     };
//     try {
//       await jsm.streams.add(conf);
//       console.log(`[NATS] stream ${streamName} created`);
//     } catch (e) {
//       console.warn("[NATS] create stream failed (maybe already exists)", e.message);
//     }
//   }
// }

// // Publish with optional JetStream persistence
// async function publish(subject, payload = {}, opts = { jetstream: true }) {
//   const { nc, js } = await connectNats();
//   const encoded = sc.encode(JSON.stringify(payload));

//   if (opts.jetstream && js) {
//     // Publish to JetStream (durable)
//     try {
//       const res = await js.publish(subject, encoded);
//       return res; // { seq, ... }
//     } catch (err) {
//       // bubble up for caller to handle retry/fallback
//       throw err;
//     }
//   } else {
//     // Fire-and-forget
//     nc.publish(subject, encoded);
//     return { ack: "none" };
//   }
// }

// // Subscribe using JetStream durable consumer
// async function subscribe(subject, handler, opts = { durable: null, queue: null, jetstream: true }) {
//   const { nc, js } = await connectNats();
//   if (opts.jetstream && js) {
//     const stream = opts.streamName || subject.split(".")[0] || "DEFAULT";
//     // consumer options
//     const copts = consumerOpts();
//     copts.deliverTo(`${process.env.SERVICE_NAME || "svc"}-${subject}-deliver`);
//     copts.durable(opts.durable || `${process.env.SERVICE_NAME || "svc"}-${subject}-dur`);
//     copts.ackExplicit();
//     if (opts.queue) copts.queue(opts.queue);
//     copts.filterSubject(subject);

//     const sub = await js.subscribe(subject, copts);
//     (async () => {
//       for await (const m of sub) {
//         try {
//           const data = JSON.parse(sc.decode(m.data));
//           await handler(data, m);
//           m.ack();
//         } catch (err) {
//           console.error("[NATS] handler error:", err);
//           // decide: m.nak() or m.term() depending on policy
//           try { m.nak(); } catch(e) {}
//         }
//       }
//     })().catch(e => console.error("subscribe loop error", e));
//     return sub;
//   } else {
//     const sub = nc.subscribe(subject, { queue: opts.queue });
//     (async () => {
//       for await (const msg of sub) {
//         try {
//           const data = JSON.parse(sc.decode(msg.data));
//           // console.log("--------->", sc.decode(msg.data));
//           // console.log("---------XXXXX",  JSON.parse(sc.decode(msg.data)));
//           // console.log("sub", sub)

//           await handler(data, msg);
//         } catch (err) {
//           console.error("[NATS] plain handler error", err);
//         }
//       }
//     })();
//     return sub;
//   }
// }

// module.exports = { connectNats, ensureStream, publish, subscribe };

const { connect, StringCodec, consumerOpts } = require("nats");

const sc = StringCodec();
let nc, js, jsm;

async function connectNats() {
  if (nc && !nc.isClosed()) return { nc, js, jsm };

  nc = await connect({
    servers: process.env.NATS_URL || "nats://localhost:4222",
    name: process.env.SERVICE_NAME || "order-service",
    reconnect: true,
    maxReconnectAttempts: -1,
  });

  js = nc.jetstream();
  jsm = await nc.jetstreamManager();
  console.log(`[NATS] Connected: ${process.env.SERVICE_NAME}`);
  return { nc, js, jsm };
}

// Ensure a stream exists, adding new subjects if needed
async function ensureStream(streamName, subjects) {
  const { jsm } = await connectNats();

  try {
    const info = await jsm.streams.info(streamName);
    const existingSubjects = info.config.subjects;

    // Add new subjects if missing
    const newSubjects = subjects.filter((s) => !existingSubjects.includes(s));
    if (newSubjects.length) {
      await jsm.streams.update(streamName, {
        subjects: [...existingSubjects, ...newSubjects],
      });
      console.log(
        `[NATS] Updated stream ${streamName} with new subjects: ${newSubjects}`
      );
    }
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

// Subscribe to a subject with JetStream auto-stream creation
async function subscribeEvent(subject, handler, opts = {}) {
  const { js, jsm, nc } = await connectNats();

  if (opts.jetstream) {
    const STREAM = process.env.JS_STREAM || "ECOM_EVENTS";

    // Ensure the stream exists and contains this subject
    await ensureStream(STREAM, [subject]);

    const sanitized = subject.replace(/\./g, "_");
    const copts = consumerOpts();
    copts.deliverTo(`${process.env.SERVICE_NAME}-${sanitized}-deliver`);
    copts.durable(`${process.env.SERVICE_NAME}-${sanitized}-durable`);
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
        if (!m.data || m.data.length === 0) continue;
        const raw = sc.decode(m.data);
        // safly parse JSON
        let data;
        try {
          data = JSON.parse(raw);
        } catch (error) {
          console.warn(
            `[Monitor] non JSON message on subject ${m.subject}`,
            raw
          );
          continue;
        }

        // const data = JSON.parse(sc.decode(m.data));
        await handler(data);
      }
    })();
  }
}

module.exports = { connectNats, ensureStream, publishEvent, subscribeEvent };
