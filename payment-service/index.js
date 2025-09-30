const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3005;

// Simulate payment processing
app.post('/payments/process', (req, res) => {
  const { orderId, amount } = req.body;
  // Simulate random approval/decline
  const success = Math.random() > 0.2;
  if (success) {
    // TODO: Publish payment.success event
    res.json({ status: 'success', orderId });
  } else {
    // TODO: Publish payment.failed event
    res.json({ status: 'failed', orderId });
  }
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
