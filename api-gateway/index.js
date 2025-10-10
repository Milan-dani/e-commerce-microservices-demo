require('dotenv').config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { proxyToService } = require('./serviceRegistory');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Microservice URLs (env fallback to localhost)
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  PRODUCTS: process.env.PRODUCTS_SERVICE_URL || "http://localhost:3002",
  CART: process.env.CART_SERVICE_URL || "http://localhost:3003",
  ORDERS: process.env.ORDERS_SERVICE_URL || "http://localhost:3004",
  PAYMENTS: process.env.PAYMENTS_SERVICE_URL || "http://localhost:3005",
  INVENTORY: process.env.INVENTORY_SERVICE_URL || "http://localhost:3006",
  RECOMMENDATIONS: process.env.RECOMMENDATIONS_SERVICE_URL || "http://localhost:3007",
  ANALYTICS: process.env.ANALYTICS_SERVICE_URL || "http://localhost:3008",
};

// JWT validation middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.use(cors());


// proxy Route with service Registory /dynamic URLs

app.use("/auth", proxyToService("auth"));
app.use("/products", proxyToService("products"));
app.use("/cart", proxyToService("cart"));
app.use("/orders", proxyToService("orders"));
app.use("/payments", proxyToService("payments"));
app.use("/inventory", proxyToService("inventory"));
app.use("/recommendations", proxyToService("recommendations"));
app.use("/analytics", proxyToService("analytics"));
// app.use("/auth", proxyToService("auth"));


// // Proxy routes
// app.use(
//   "/auth",
//   createProxyMiddleware({
//     target: SERVICES.AUTH,
//     changeOrigin: true,
//     pathRewrite: { "^/auth": "" },
//   })
// );

// app.use(
//   "/products",
//   createProxyMiddleware({
//     target: SERVICES.PRODUCTS,
//     changeOrigin: true,
//     pathRewrite: { "^/products": "" },
//   })
// );

// app.use(
//   "/cart",
//   authenticateJWT,
//   createProxyMiddleware({
//     target: SERVICES.CART,
//     changeOrigin: true,
//     pathRewrite: { "^/cart": "" },
//   })
// );

// app.use(
//   "/orders",
//   authenticateJWT,
//   createProxyMiddleware({
//     target: SERVICES.ORDERS,
//     changeOrigin: true,
//     pathRewrite: { "^/orders": "" },
//   })
// );

// app.use(
//   "/payments",
//   authenticateJWT,
//   createProxyMiddleware({
//     target: SERVICES.PAYMENTS,
//     changeOrigin: true,
//     pathRewrite: { "^/payments": "" },
//   })
// );

// app.use(
//   "/inventory",
//   authenticateJWT,
//   createProxyMiddleware({
//     target: SERVICES.INVENTORY,
//     changeOrigin: true,
//     pathRewrite: { "^/inventory": "" },
//   })
// );

// app.use(
//   "/recommendations",
//   authenticateJWT,
//   createProxyMiddleware({
//     target: SERVICES.RECOMMENDATIONS,
//     changeOrigin: true,
//     pathRewrite: { "^/recommendations": "" },
//   })
// );

// app.use(
//   "/analytics",
//   authenticateJWT,
//   createProxyMiddleware({
//     target: SERVICES.ANALYTICS,
//     changeOrigin: true,
//     pathRewrite: { "^/analytics": "" },
//   })
// );

app.get("/", (req, res) => {
  res.send("API Gateway is running");
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
