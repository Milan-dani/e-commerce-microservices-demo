require("dotenv").config();
const express = require("express");
// const bodyParser = require("body-parser");
const { connectDB, sequelize } = require("./db/sequelize");
const registerService = require("./serviceRegistry/registerService");
const { get, post } = require("./serviceRegistry/serviceClient");
const { authenticate, requireAdmin } = require("./middleware/authMiddleware");
const Order = require("./models/Order");
const OrderSequence = require("./models/OrderSequence");
const { startSubscriber } = require("./nats/orderSubscriber");

const app = express();
// app.use(bodyParser.json());
app.use(express.json());

const PORT = process.env.PORT || 3004;
const SERVICE_NAME = process.env.SERVICE_NAME || "orders";

async function getNextOrderNumber() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  return await sequelize.transaction(async (t) => {
    // Try to get today's counter row
    let counter = await OrderSequence.findOne({
      where: { orderDate: today },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    let seq = 1;

    if (!counter) {
      // First order today
      counter = await OrderSequence.create(
        { orderDate: today, lastSequence: seq },
        { transaction: t }
      );
    } else {
      // Increment sequence
      seq = counter.lastSequence + 1;
      counter.lastSequence = seq;
      await counter.save({ transaction: t });
    }

    const seqPadded = String(seq).padStart(4, "0"); // 0001
    const dateStr = today.replace(/-/g, "");        // YYYYMMDD
    return `ORD-${dateStr}-${seqPadded}`;
  });
}



// Health endpoint for Consul
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
// app.use("/orders", orderRoutes);

app.post("/checkout/create", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { items ,shippingFee = 0} = req.body;

  if (!items || !items.length) return res.status(400).json({ error: "Cart is empty" });

  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await get("products", `/products/${item.productId}`);
    if (!product) return res.status(404).json({ error: "Product not found" });

    validatedItems.push({
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
    subtotal += product.price * item.quantity;
  }
  total = Number((subtotal + shippingFee).toFixed(2))
  const orderNumber = await getNextOrderNumber();
  const order = await Order.create({
    userId,
    orderNumber,
    items: validatedItems,
    subtotal,
    total: total, // changed from subtotal
    shippingFee: shippingFee, // changed from 0
    status: "pending",
    currentStep: 1,
  });

  res.json(order);
});
app.patch("/checkout/:orderId/shipping", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { orderId } = req.params;
  const { name, address, city, state, country, pincode, phone } = req.body;

  const order = await Order.findOne({ where: { id: orderId, userId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.shippingInfo = { name, address, city, state, country, pincode, phone };
  order.currentStep = 2;
  await order.save();

  res.json(order);
});
app.patch("/checkout/:orderId/payment", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { orderId } = req.params;
  const { paymentMethod, cardToken } = req.body; // cardToken from payment gateway

  const order = await Order.findOne({ where: { id: orderId, userId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.paymentInfo = { method: paymentMethod, cardToken, status: "pending" };
  order.currentStep = 3;
  await order.save();

  res.json(order);
});
app.post("/checkout/:orderId/place", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { orderId } = req.params;

  const order = await Order.findOne({ where: { id: orderId, userId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Call Payment-Service microservice
  // const paymentResult = await post("payments", "/process", {
  //   amount: order.total,
  //   cardToken: order.paymentInfo.cardToken,
  // });

   const paymentResultX = await post("payments", "/process", {
    orderId: order.id,
    amount: order.total,
    cardToken: order.paymentInfo.cardToken,
    userId: order.userId,
    idempotencyKey: order.id // or a dedicated key
  });
  const {status : remoteStatus, data} = await post("payments", "/process", {
    orderId: order.id,
    amount: order.total,
    cardToken: order.paymentInfo.cardToken,
    userId: order.userId,
    idempotencyKey: order.id // or a dedicated key
  });
  if (remoteStatus === 200 || remoteStatus === 201) {
    // immediate result
    if (data.success && data.status === "paid") {
      order.paymentInfo = { ...order.paymentInfo, status: "paid", transactionId: data.transactionId };
      order.status = "paid";
    } else {
      order.paymentInfo = { ...order.paymentInfo, status: data.status || "failed", reason: data.reason };
      order.status = "pending";
    }
    await order.save();
    return res.json(order);
  }

  if (remoteStatus === 202) {
    // accepted for async processing. Keep order pending; NATS will update when event published
    order.paymentInfo = { ...order.paymentInfo, status: "pending", transactionId: data.transactionId || null };
    order.status = "pending";
    await order.save();
    return res.status(202).json({ message: "Payment processing", order });
  }

  // remoteStatus === 0 or other code => treat as error
  order.paymentInfo = { ...order.paymentInfo, status: "failed", reason: data.reason || "payment-service-unavailable" };
  order.status = "pending";


  // //////////////////////////
  const paymentResult = { success : true, transactionId: '328173923jsjcscy2y12739'}

  if (paymentResult.success) {
    order.paymentInfo.status = "paid";
    order.paymentInfo.transactionId = paymentResult.transactionId;
    order.status = "paid";
  } else {
    order.paymentInfo.status = "failed";
    order.status = "pending";
    order.paymentInfo.reason = paymentResult.reason;
  }

  await order.save();
  res.json(order);
});

// GET all orders for logged-in user
app.get("/", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { page = 1, limit = 10, status } = req.query;
  const where = { userId };
  if (status) where.status = status;

  const orders = await Order.findAll({
    where,
    limit: +limit,
    offset: (page - 1) * limit,
    order: [["createdAt", "DESC"]],
  });

  res.json(orders);
});

// GET single order
app.get("/:id", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const order = await Order.findOne({ where: { id: req.params.id, userId } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.patch("/admin/orders/:orderId/status", authenticate, requireAdmin ,async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "fulfilled"];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const order = await Order.findOne({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = status;
  await order.save();

  if (status === "fulfilled") {
    // Decrement stock via Product service
    for (const item of order.items) {
      await post("products", `/products/${item.productId}/decrement`, { quantity: item.quantity });
    }
  }

  res.json(order);
});


// app.post("/checkout/create", authenticate, async (req, res) => {
//   const { id: userId } = req.user;
//   const { items , shippingFee = 0} = req.body;

//   if (!items || !items.length) return res.status(400).json({ error: "Cart is empty" });

//   // Validate products
//   let subtotal = 0;
//   const validatedItems = [];
//   for (const item of items) {
//     const product = await get("products", `/products/${item.productId}`);
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     validatedItems.push({
//       productId: item.productId,
//       name: product.name,
//       price: product.price,
//       quantity: item.quantity,
//     });
//     subtotal += product.price * item.quantity;
//   }
//   const total = Number((total + shippingFee).toFixed(2));
//   const orderNumber = await getNextOrderNumber();

//   const order = await Order.create({
//     userId,
//     orderNumber,
//     items: validatedItems,
//     subtotal,
//     total,
//     shippingFee: 0,
//     status: "pending",
//   });

//   res.json(order);
// });

// app.patch("/checkout/:orderId/shipping", authenticate, async (req, res) => {
//   const { id: userId } = req.user;
//   const { orderId } = req.params;
//   const { name, address, city, state, country, pincode, phone } = req.body;

//   const order = await Order.findOne({ where: { id: orderId, userId } });
//   if (!order) return res.status(404).json({ error: "Order not found" });

//   order.shippingInfo = { name, address, city, state, country, pincode, phone };
//   await order.save();

//   res.json(order);
// });

// app.patch("/checkout/:orderId/payment", authenticate, async (req, res) => {
//   const { id: userId } = req.user;
//   const { orderId } = req.params;
//   const { paymentMethod, cardDetails } = req.body;

//   const order = await Order.findOne({ where: { id: orderId, userId } });
//   if (!order) return res.status(404).json({ error: "Order not found" });

//   // You can call Payment-Service here to generate session or token
//   order.paymentInfo = { method: paymentMethod, cardDetails, status: "pending" };
//   await order.save();

//   res.json(order);
// });

// app.post("/checkout/:orderId/place", authenticate, async (req, res) => {
//   const { id: userId } = req.user;
//   const { orderId } = req.params;

//   const order = await Order.findOne({ where: { id: orderId, userId } });
//   if (!order) return res.status(404).json({ error: "Order not found" });

//   // Call Payment-Service to process payment
//   // Example: const paymentResult = await paymentService.process(order.paymentInfo);
//   // For demo, let's assume payment success:
//   order.paymentInfo.status = "paid";
//   order.status = "paid";
//   await order.save();

//   res.json(order);
// });

// For admin

// app.patch("/admin/orders/:orderId/status", authenticate, async (req, res) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "fulfilled"];
//   if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

//   const order = await Order.findOne({ where: { id: orderId } });
//   if (!order) return res.status(404).json({ error: "Order not found" });

//   order.status = status;
//   await order.save();

//   if (status === "fulfilled") {
//     // Decrement stock
//     for (const item of order.items) {
//       await post("products", `/products/${item.productId}/decrement`, { quantity: item.quantity });
//     }
//   }

//   res.json(order);
// });











// Create a new order



app.post("/", authenticate, async (req, res) => {
  console.log(req.userId,req.user, req.body);
  
  //  const userId = req.userId;
   const {id :userId} = req.user;
  const { items, shippingFee = 0 } = req.body;

  // const product = await get("products", `/products/${items[0].productId}`);
  // if (!product) return res.status(404).json({ error: "Product not found" });

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
    total = Number((total + shippingFee).toFixed(2))

    const orderNumber = await getNextOrderNumber();

    const order = await Order.create({
      userId,
      items: validatedItems,
      shippingFee,
      total,
      orderNumber,
    });

    res.json(order);
    // res.status(200).json({ message: 'testing...' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for logged-in user
app.get("/", authenticate, async (req, res) => {
  // const userId = req.userId;
  const {id :userId} = req.user;
  const orders = await Order.findAll({ where: { userId } });
  res.json(orders);
});

// Get single order by ID
app.get("/:id", authenticate, async (req, res) => {
  // const userId = req.userId;
  const {id :userId} = req.user;
  const order = await Order.findOne({
    where: { id: req.params.id, userId },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// PATCH endpoint to update order status
app.patch("/:id/status",authenticate ,async (req, res) => {
  // const userId = req.userId;
  const {id :userId} = req.user;
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
    startSubscriber();
  });
}

startServer();
