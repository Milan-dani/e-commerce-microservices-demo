const express = require('express');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// JWT validation middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Example proxy routes (replace targets with actual service URLs)
app.use('/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/products', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/cart', authenticateJWT, createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/orders', authenticateJWT, createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));
app.use('/payments', authenticateJWT, createProxyMiddleware({ target: 'http://localhost:3005', changeOrigin: true }));
app.use('/inventory', authenticateJWT, createProxyMiddleware({ target: 'http://localhost:3006', changeOrigin: true }));
app.use('/recommendations', authenticateJWT, createProxyMiddleware({ target: 'http://localhost:3007', changeOrigin: true }));
app.use('/analytics', authenticateJWT, createProxyMiddleware({ target: 'http://localhost:3008', changeOrigin: true }));

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
