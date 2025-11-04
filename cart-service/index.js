require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const registerService = require("./serviceRegistry/registerService");
const { get } = require("./serviceRegistry/serviceClient");
const { authenticate } = require("./middleware/authMiddleware");
const Cart = require("./models/Cart");
const { initBroker } = require("@milan-dani/message-broker");

const app = express();
app.use(express.json());
let broker;

const PORT = process.env.PORT || 3003;
const SERVICE_NAME = process.env.SERVICE_NAME || "cart";
const JS_STREAM = process.env.JS_STREAM || "ECOM_EVENTS";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cart";

// // Dynamic registration
// registerService(SERVICE_NAME, PORT);

// Add item to cart
app.post("/add", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  const { id: userId } = req.user;

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
    await broker.emit("cart.item.added", {
      cartId: cart?.id || "",
      userId: userId,
      productId: product?._id || "",
      quantity: quantity,
    });
 
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update qunatity
app.post("/update", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  const { id: userId } = req.user;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex((i) => i.productId === productId);
    if (itemIndex === -1)
      return res.status(404).json({ error: "Item not in cart" });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await broker.emit("cart.item.updated", {
      cartId: cart?.id || "",
      userId: userId,
      productId: productId,
      quantity: quantity,
    });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
app.post("/remove", authenticate, async (req, res) => {
  const { productId } = req.body;
  const { id: userId } = req.user;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    await broker.emit("cart.item.removed", {
      cartId: cart?.id || "",
      userId: userId,
      productId: productId,
    });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart
app.get("/", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    //     // added timeout to check loading states in frontend
    // setTimeout(() => {
    //   console.log("timeout");
    //    res.json(cart);
    // }, 20000);

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
    app.listen(PORT, async () => {
      console.log(`Cart Service running on port ${PORT}`);
      await registerService(SERVICE_NAME, PORT);
      broker = await initBroker({
        serviceName: SERVICE_NAME,
        stream: JS_STREAM,
      });
      await new Promise((r) => setTimeout(r, 500)); // small delay helps stabilize connection
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
