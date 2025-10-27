const { logInfo, logError } = require("./utils/logger");

const CONSUL_URL = process.env.CONSUL_URL || "http://localhost:8500";

async function syncWithConsul(serviceName, topics) {
    try {
      const response = await fetch(`${CONSUL_URL}/register-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: serviceName,
          topics,
          // timestamp: new Date().toISOString(),
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      logInfo(`[Broker] Synced ${serviceName} topics with Local-Consul`);
    } catch (err) {
      logError("[Broker] Failed to sync with Local-Consul", err.message);
    }
  }
  

module.exports = { syncWithConsul };
