// const { connect, StringCodec, consumerOpts } = require("nats");

// const sc = StringCodec();
// let nc, js, jsm;

// async function connectNats() {
//   if (nc && !nc.isClosed()) return { nc, js, jsm };

//   nc = await connect({
//     servers: process.env.NATS_URL || "nats://localhost:4222",
//     name: process.env.SERVICE_NAME || "orders-service",
//     reconnect: true,
//     maxReconnectAttempts: -1,
//   });

//   js = nc.jetstream();
//   jsm = await nc.jetstreamManager();
//   console.log(`[NATS] Connected: ${process.env.SERVICE_NAME}`);
//   return { nc, js, jsm };
// }

// async function ensureStream(streamName, subjects) {
//   const { jsm } = await connectNats();
//   try {
//     await jsm.streams.info(streamName);
//   } catch {
//     await jsm.streams.add({ name: streamName, subjects, storage: "file" });
//     console.log(`[NATS] Created stream: ${streamName}`);
//   }
// }

// async function publishEvent(subject, payload, opts = { jetstream: true }) {
//   const { js, nc } = await connectNats();
//   const data = sc.encode(JSON.stringify(payload));

//   if (opts.jetstream && js) {
//     await js.publish(subject, data);
//   } else {
//     nc.publish(subject, data);
//   }
//   console.log(`📤 Event published: ${subject}`);
// }

// async function subscribeEvent(subject, handler, opts = {}) {
//   const { js, nc } = await connectNats();

//   if (opts.jetstream) {
    
//     const sanitizedSubject = subject.replace(/\./g, "_");
//     const copts = consumerOpts();
//     copts.deliverTo(`${process.env.SERVICE_NAME}-${sanitizedSubject}-deliver`);
//     copts.durable(`${process.env.SERVICE_NAME}-${sanitizedSubject}-durable`);
//     copts.ackExplicit();
//     copts.filterSubject(subject);
    
//     console.log(subject,  copts.filterSubject(subject));
//     const sub = await js.subscribe(subject, copts);
//     console.log(`📥 Subscribed (JetStream): ${subject}`);

//     (async () => {
//       for await (const m of sub) {
//         try {
//           const data = JSON.parse(sc.decode(m.data));
//           await handler(data, m);
//           m.ack();
//         } catch (err) {
//           console.error(`[NATS] Handler failed for ${subject}:`, err.message);
//           m.nak();
//         }
//       }
//     })();
//   } else {
//     const sub = nc.subscribe(subject);
//     console.log(`📥 Subscribed: ${subject}`);
//     (async () => {
//       for await (const m of sub) {
//         const data = JSON.parse(sc.decode(m.data));
//         await handler(data);
//       }
//     })();
//   }
// }

// module.exports = { connectNats, ensureStream, publishEvent, subscribeEvent };




const { connect, StringCodec, consumerOpts } = require("nats");

const sc = StringCodec();
let nc, js, jsm;

async function connectNats() {
  if (nc && !nc.isClosed()) return { nc, js, jsm };

  nc = await connect({
    servers: process.env.NATS_URL || "nats://localhost:4222",
    name: process.env.SERVICE_NAME || "products-service",
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
      console.log(`[NATS] Updated stream ${streamName} with new subjects: ${newSubjects}`);
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
        const data = JSON.parse(sc.decode(m.data));
        await handler(data);
      }
    })();
  }
}


// async function subscribeEvent(subject, handler, opts = {}) {
//   const { js, jsm, nc, sc } = await connectNats();

//   if (opts.jetstream) {
//     const STREAM = process.env.JS_STREAM || "ECOM_EVENTS";

//     // Ensure the stream exists and contains this subject
//     await ensureStream(STREAM, [subject]);

//     const sanitized = subject.replace(/\./g, "_");
//     const copts = consumerOpts();
//     copts.deliverTo(`${process.env.SERVICE_NAME}-${sanitized}-deliver`);
//     copts.durable(`${process.env.SERVICE_NAME}-${sanitized}-durable`);
//     copts.ackExplicit();
//     copts.filterSubject(subject);

//     const sub = await js.subscribe(subject, copts);
//     console.log(`📥 Subscribed (JetStream): ${subject}`);

//     (async () => {
//       for await (const m of sub) {
//         let data = null;

//         try {
//           const raw = m.data ? sc.decode(m.data) : "{}";
//           if (!raw || raw.trim().length === 0) {
//             console.warn(`[NATS] Empty message received for ${subject}`);
//             m.ack(); // or m.term() if you don't want retries
//             continue;
//           }

//           try {
//             data = JSON.parse(raw);
//           } catch (parseErr) {
//             console.error(`[NATS] Invalid JSON for ${subject}:`, parseErr.message, raw);
//             m.ack(); // acknowledge anyway to skip bad messages
//             continue;
//           }

//           await handler(data, m);
//           m.ack();
//         } catch (err) {
//           console.error(`[NATS] Handler failed for ${subject}:`, err.message);
//           m.nak(); // tell JetStream to retry later
//         }
//       }
//     })();
//   } else {
//     const sub = nc.subscribe(subject);
//     console.log(`📥 Subscribed: ${subject}`);

//     (async () => {
//       for await (const m of sub) {
//         let data = null;
//         const raw = m.data ? sc.decode(m.data) : "{}";

//         if (!raw || raw.trim().length === 0) {
//           console.warn(`[NATS] Empty message received for ${subject}`);
//           continue;
//         }

//         try {
//           data = JSON.parse(raw);
//         } catch (parseErr) {
//           console.error(`[NATS] Invalid JSON for ${subject}:`, parseErr.message, raw);
//           continue;
//         }

//         try {
//           await handler(data);
//         } catch (err) {
//           console.error(`[NATS] Handler failed for ${subject}:`, err.message);
//         }
//       }
//     })();
//   }
// }


module.exports = { connectNats, ensureStream, publishEvent, subscribeEvent };
