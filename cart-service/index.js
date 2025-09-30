const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cart';

// Cart schema
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: String,
      quantity: Number
    }
  ]
});
const Cart = mongoose.model('Cart', cartSchema);

// Add item to cart
app.post('/cart/:userId/add', async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) cart = await Cart.create({ userId: req.params.userId, items: [] });
  const itemIndex = cart.items.findIndex(i => i.productId === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }
  await cart.save();
  res.json(cart);
});

// Remove item from cart
app.post('/cart/:userId/remove', async (req, res) => {
  const { productId } = req.body;
  let cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  cart.items = cart.items.filter(i => i.productId !== productId);
  await cart.save();
  res.json(cart);
});

// Get cart
app.get('/cart/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  res.json(cart);
});

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Cart Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
