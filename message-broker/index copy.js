// Example NATS message broker setup
const { connect, StringCodec } = require('nats');

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
const sc = StringCodec();

async function run() {
  const nc = await connect({ servers: NATS_URL });
  console.log('Connected to NATS');

  // Example: subscribe to order.created
  const sub = nc.subscribe('order.created');
  (async () => {
    for await (const m of sub) {
      console.log(`Received order.created: ${sc.decode(m.data)}`);
      // TODO: Forward to payment service
    }
  })();

  // Example: publish payment.success
  // nc.publish('payment.success', sc.encode(JSON.stringify({ orderId: '123', status: 'success' })));
}

run().catch(console.error);
