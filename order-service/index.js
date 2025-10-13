require("dotenv").config();
const express = require("express");
// const bodyParser = require("body-parser");
const { connectDB, sequelize } = require("./db/sequelize");
const registerService = require("./serviceRegistry/registerService");
const { get } = require("./serviceRegistry/serviceClient");
const { authenticate } = require("./middleware/authMiddleware");
const Order = require("./models/Order");

const app = express();
// app.use(bodyParser.json());
app.use(express.json());

const PORT = process.env.PORT || 3004;
const SERVICE_NAME = process.env.SERVICE_NAME || "orders";

// Health endpoint for Consul
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
// app.use("/orders", orderRoutes);


// Create a new order
app.post("/", authenticate, async (req, res) => {
  console.log(req.userId,req.user, req.body);
  
  //  const userId = req.userId;
   const {id :userId} = req.user;
  const { items, shippingFee = 0 } = req.body;

  const product = await get("products", `/products/${item.productId}`);
  if (!product) return res.status(404).json({ error: "Product not found" });

  try {
    let validatedItems = [];
    let total = 0;

    // Validate products via Product Service
    for (const item of items) {
      const product = await get("products", `/products/${item.productId}`);
      if (!product) return res.status(404).json({ error: "Product not found" });

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      total += product.price * item.quantity;
    }

    // total += shippingFee;

    // const order = await Order.create({
    //   userId,
    //   items: validatedItems,
    //   shippingFee,
    //   total,
    // });

    // res.json(order);
    res.status(200).json({ message: 'testing...' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for logged-in user
app.get("/", authenticate, async (req, res) => {
  const userId = req.userId;
  const orders = await Order.findAll({ where: { userId } });
  res.json(orders);
});

// Get single order by ID
app.get("/:id", authenticate, async (req, res) => {
  const userId = req.userId;
  const order = await Order.findOne({
    where: { id: req.params.id, userId },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// PATCH endpoint to update order status
app.patch("/:id/status",authenticate ,async (req, res) => {
  const userId = req.userId;
  const { status } = req.body;

  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    // TODO: trigger payment or shipping logic here in the future

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  await connectDB();
  await sequelize.sync(); // ensures table creation
  app.listen(PORT, async () => {
    console.log(`🛒 Order Service running on port ${PORT}`);
    await registerService(SERVICE_NAME, PORT);
  });
}

startServer();
