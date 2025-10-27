import { connect, JSONCodec } from "nats";

const NATS_URL = process.env.NATS_URL || "nats://nats:4222";
const codec = JSONCodec();
const nc = await connect({ servers: NATS_URL });

export const publishEvent = (subject, payload) => nc.publish(subject, codec.encode(payload));
export const subscribeEvent = (subject, handler) => {
  const sub = nc.subscribe(subject);
  (async () => {
    for await (const msg of sub) {
      handler(codec.decode(msg.data));
    }
  })();
};
