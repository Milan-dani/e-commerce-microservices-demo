// const fetch = require("node-fetch");
const os = require("os");

// Default Consul URL
const CONSUL_URL = process.env.CONSUL_URL || "http://localhost:8500";

/**
 * Dynamically registers a microservice instance with local Consul.
 * Works for local development and Docker containers.
 * @param {string} serviceName - Name of the service (e.g., "cart")
 * @param {number} port - Port the service is running on
 */
async function registerService(serviceName, port) {
  // Determine host dynamically
  // Inside Docker, process.env.HOST can be set; otherwise, fallback to local IP
  let host = process.env.HOST;

  if (!host) {
    // Attempt to get local network IP
    const interfaces = os.networkInterfaces();
    host =
      Object.values(interfaces)
        .flat()
        .filter((i) => i && !i.internal && i.family === "IPv4")
        .map((i) => i.address)[0] || "localhost";
  }

  const serviceUrl = `http://${host}:${port}`;

  // Register service
  try {
    await fetch(`${CONSUL_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: serviceName, url: serviceUrl }),
    });
    console.log(`${serviceName} registered at ${serviceUrl}`);
  } catch (err) {
    console.error(`Failed to register ${serviceName}:`, err);
  }

  // Deregister on exit
  const deregister = async () => {
    try {
      await fetch(`${CONSUL_URL}/deregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: serviceName, url: serviceUrl }),
      });
      console.log(`${serviceName} deregistered from ${serviceUrl}`);
    } catch (err) {
      console.error(`Failed to deregister ${serviceName}:`, err);
    } finally {
      process.exit(0); // exit only after deregister attempt
    }
    // process.exit();
  };

  process.on("SIGINT", deregister);
  process.on("SIGTERM", deregister);
}

module.exports = registerService;
