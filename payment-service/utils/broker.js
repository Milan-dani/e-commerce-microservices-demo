let brokerInstance = null;

function setBroker(broker) {
  brokerInstance = broker;
}

function getBroker() {
  if (!brokerInstance) throw new Error("Broker not initialized yet!");
  return brokerInstance;
}

module.exports = { setBroker, getBroker };
