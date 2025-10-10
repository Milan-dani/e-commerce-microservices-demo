import dotenv from 'dotenv';
import { createProxyMiddleware } from "http-proxy-middleware"; { createProxyMiddleware };


// const { createProxyMiddleware } = require("http-proxy-middleware");
// const fetch = require("node-fetch");
dotenv.config();

const CONSUL_URL = process.env.CONSUL_URL || "http://localhost:8500";

// Get a healthy instance of the service
async function getServiceUrl(serviceName) {
  try {
    const res = await fetch(`${CONSUL_URL}/discover/${serviceName}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error(`Error fetching ${serviceName}:`, err);
    return null;
  }
}

// Dynamic proxy middleware
export const proxyToService = (serviceName) => {
  console.log({serviceName});
  
  return async (req, res, next) => {
    const url = await getServiceUrl(serviceName);
    if (!url) return res.status(503).send(`${serviceName} service unavailable`);

    createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path) => path.replace(`/${serviceName}`, ""),
    })(req, res, next);
  };
}
