const CONSUL_URL = process.env.CONSUL_URL || "http://localhost:8500";

/**
 * Get a healthy instance URL of a service from local Consul
 * @param {string} serviceName - Name of the service (e.g., "products")
 */
// async function getServiceUrl(serviceName) {
//   try {
//     const res = await fetch(`${CONSUL_URL}/discover/${serviceName}`);
//     if (!res.ok) throw new Error(`${serviceName} service unavailable`);
//     const data = await res.json();
//     return data.url;
//   } catch (err) {
//     console.error(`Error discovering service ${serviceName}:`, err.message);
//     throw err;
//   }
// }
async function getServiceUrl(serviceName, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${CONSUL_URL}/discover/${serviceName}`);
      if (!res.ok) throw new Error(`${serviceName} service unavailable`);
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.warn(`Discover attempt ${i + 1} failed for ${serviceName}:`, err.message);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 100)); // small delay before retry
    }
  }
}


/**
 * Make a GET request to another microservice
 * @param {string} serviceName - Target service name
 * @param {string} path - Endpoint path (e.g., "/products/123")
 */
// async function get(serviceName, path) {
//   const baseUrl = await getServiceUrl(serviceName);
//   const res = await fetch(`${baseUrl}${path}`);
//   if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
//   return res.json();
// }
async function get(serviceName, path) {
  try {
    const baseUrl = await getServiceUrl(serviceName);
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    return res.json();
  } catch (err) {
    console.error(`GET ${serviceName}${path} failed:`, err.message);
    throw err;
  }
}

/**
 * Make a POST request to another microservice
 * @param {string} serviceName - Target service name
 * @param {string} path - Endpoint path
 * @param {object} body - JSON body
 */
// async function post(serviceName, path, body) {
//   const baseUrl = await getServiceUrl(serviceName);
//   const res = await fetch(`${baseUrl}${path}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });
//   if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
//   return res.json();
// }
async function post(serviceName, path, body) {
  try {
    const baseUrl = await getServiceUrl(serviceName);
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    return res.json();
  } catch (err) {
    console.error(`POST ${serviceName}${path} failed:`, err.message);
    throw err;
  }
}

module.exports = { getServiceUrl, get, post };
