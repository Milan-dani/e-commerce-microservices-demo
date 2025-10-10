require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const registerService = require("./serviceRegistry/registerService");
const { get } = require("./serviceRegistry/serviceClient");
const { authenticate } = require("./middleware/authMiddleware");
const Cart = require("./models/Cart");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;
const SERVICE_NAME = process.env.SERVICE_NAME || "cart";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cart";


// Dynamic registration
registerService(SERVICE_NAME, PORT);

// Add item to cart
app.post("/add", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  
  const {id :userId} = req.user;

  try {
    // Validate product exists
    const product = await get("products", `/products/${productId}`);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const itemIndex = cart.items.findIndex((i) => i.productId === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update qunatity
app.post("/update", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  const {id :userId} = req.user;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex((i) => i.productId === productId);
    if (itemIndex === -1) return res.status(404).json({ error: "Item not in cart" });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Remove item from cart
app.post("/remove", authenticate, async (req, res) => {
  const { productId } = req.body;
  const {id :userId} = req.user;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart
app.get("/", authenticate ,async (req, res) => {
  const {id :userId} = req.user;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Cart Service running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
