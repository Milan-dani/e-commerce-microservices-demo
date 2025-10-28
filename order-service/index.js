require("dotenv").config();
const express = require("express");
// const bodyParser = require("body-parser");
const { connectDB, sequelize } = require("./db/sequelize");
// const registerService = require("./serviceRegistry/registerService");
const { get, post } = require("./serviceRegistry/serviceClient");
const { authenticate, requireAdmin } = require("./middleware/authMiddleware");
const Order = require("./models/Order");
const OrderSequence = require("./models/OrderSequence");
const { startSubscriber } = require("./nats/orderSubscriber");
const { Op, Sequelize } = require("sequelize");
const {
  registerService,
  startListening,
  justConnectNATS,
  setupEventSubscriptions,
} = require("./subscriber");
const { connectNats } = require("./utils/natsClient");
const { drainOutbox, emit } = require("./utils/eventEmitter");

const app = express();
// app.use(bodyParser.json());
app.use(express.json());

const PORT = process.env.PORT || 3004;
const SERVICE_NAME = process.env.SERVICE_NAME || "orders";
const MESSAGE_BROKER_URL =
  process.env.MESSAGE_BROKER_URL || "http://localhost:3009";

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
    const dateStr = today.replace(/-/g, ""); // YYYYMMDD
    return `ORD-${dateStr}-${seqPadded}`;
  });
}

// Health endpoint for Consul
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
// app.use("/orders", orderRoutes);

app.post("/checkout/create", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { items, shippingFee = 0 } = req.body;

  if (!items || !items.length)
    return res.status(400).json({ error: "Cart is empty" });

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
      image: product.image,
    });
    subtotal += product.price * item.quantity;
  }
  total = Number((subtotal + shippingFee).toFixed(2));
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

  // Emit Event To NATS
  await emit("order.created", {
    orderId: order.id,
    userId,
    total,
  });

  res.json(order);
});
app.patch("/checkout/:orderId/shipping", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { orderId } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    country,
  } = req.body;

  const order = await Order.findOne({ where: { id: orderId, userId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.shippingInfo = {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    country,
  };
  order.currentStep = 2;
  await order.save();

  res.json(order);
});
app.patch("/checkout/:orderId/payment", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { orderId } = req.params;
  // const { paymentMethod, cardToken } = req.body; // cardToken from payment gateway
  const paymentInfo = req.body; // cardToken from payment gateway

  const order = await Order.findOne({ where: { id: orderId, userId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // order.paymentInfo = { method: paymentMethod, cardToken, status: "pending" };
  order.paymentInfo = {
...paymentInfo,
    status: "pending",
  };
  order.currentStep = 3;
  await order.save();

  res.json(order);
});

// app.patch("/checkout/:orderId/payment", authenticate, async (req, res) => {
//   const { id: userId } = req.user;
//   const { orderId } = req.params;
//   // const { paymentMethod, cardToken } = req.body; // cardToken from payment gateway
//   const { cardNumber, expiryDate, cvv, cardName } = req.body; // cardToken from payment gateway

//   const order = await Order.findOne({ where: { id: orderId, userId } });
//   if (!order) return res.status(404).json({ error: "Order not found" });

//   // order.paymentInfo = { method: paymentMethod, cardToken, status: "pending" };
//   order.paymentInfo = {
//     cardNumber,
//     expiryDate,
//     cvv,
//     cardName,
//     status: "pending",
//   };
//   order.currentStep = 3;
//   await order.save();

//   res.json(order);
// });



app.post("/checkout/:orderId/place", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { orderId } = req.params;

  try {
    // 1️⃣ Fetch order
    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 2️⃣ Basic validation
    if (!order.paymentInfo || !order.paymentInfo.id)
      return res.status(400).json({ error: "Missing payment method" });

    // 3️⃣ Call Payment Service
    let paymentResult;
    // try {
    //   paymentResult = await post("payments", "/process", {
    //     orderId: order.id,
    //     amount: order.total,
    //     userId: order.userId,
    //     paymentMethodId: order.paymentInfo.id, // pm_xxx from Stripe
    //     idempotencyKey: `order-${order.id}`,
    //   });
    // } catch (err) {
    //   console.error("Payment Service unavailable:", err.message);
    //   // Graceful degradation: keep order pending, let retry/cron handle
    //   order.paymentInfo.status = "pending";
    //   order.paymentInfo.reason = "Payment service unavailable";
    //   order.status = "pending";
    //   await order.save();
    //   return res.status(503).json({
    //     success: false,
    //     message: "Payment service unavailable, order kept pending",
    //   });
    // }
    try {
      paymentResult = await post("payments", "/process", {
        orderId: order.id,
        amount: order.total,
        userId: order.userId,
        paymentMethodId: order.paymentInfo.id,
        idempotencyKey: `order-${order.id}`,
      });
    } catch (err) {
      if (err.status && err.status < 500) {
        // ⚠️ Payment failed due to user/card issue, NOT service down
        console.warn("Payment failed (user/card issue):", err.message);
    
        order.paymentInfo.status = "failed";
        order.paymentInfo.reason = err.response?.reason || err.message;
        order.status = "failed";
        await order.save();
    
        return res.status(400).json({
          success: false,
          message: err.response?.reason || "Payment failed",
          order,
        });
      }
    
      // 🚨 Real service failure (network, consul, crash, etc.)
      console.error("Payment Service unavailable:", err.message);
      order.paymentInfo.status = "pending";
      order.paymentInfo.reason = "Payment service unavailable";
      order.status = "pending";
      await order.save();
      return res.status(503).json({
        success: false,
        message: "Payment service unavailable, order kept pending",
      });
    }
    

    // 4️⃣ Handle Payment Service response
    if (paymentResult.success && paymentResult.status === "paid") {
      order.paymentInfo.status = "paid";
      order.paymentInfo.transactionId = paymentResult.transactionId;
      order.status = "paid";

      await order.save();

      // Publish "order.paid" for analytics/notifications/etc.
      await emit("order.paid", {
        orderId: order.id,
        userId,
        transactionId: paymentResult.transactionId,
        amount: order.total,
        items: order.items
      });

      return res.json({ success: true, order });
    }

    // Payment failed or pending
    order.paymentInfo.status = paymentResult.status || "failed";
    order.paymentInfo.reason = paymentResult.reason || "Payment not completed";
    order.status = paymentResult.status === "pending" ? "pending" : "failed";

    await order.save();

    if (paymentResult.status === "pending") {
      return res.status(202).json({
        success: true,
        message: "Payment pending. Awaiting Stripe confirmation.",
        order,
      });
    }

    return res.status(400).json({
      success: false,
      message: paymentResult.reason || "Payment failed",
      order,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// app.post("/checkout/:orderId/place", authenticate, async (req, res) => {
//   const { id: userId } = req.user;
//   const { orderId } = req.params;

//   const order = await Order.findOne({ where: { id: orderId, userId } });
//   if (!order) return res.status(404).json({ error: "Order not found" });

//   // Call Payment-Service microservice
//   // const paymentResult = await post("payments", "/process", {
//   //   amount: order.total,
//   //   cardToken: order.paymentInfo.cardToken,
//   // });

//   //  const paymentResultX = await post("payments", "/process", {
//   //   orderId: order.id,
//   //   amount: order.total,
//   //   cardToken: order.paymentInfo.cardToken,
//   //   userId: order.userId,
//   //   idempotencyKey: order.id // or a dedicated key
//   // });
//   // const {status : remoteStatus, data} = await post("payments", "/process", {
//   //   orderId: order.id,
//   //   amount: order.total,
//   //   cardToken: order.paymentInfo.cardToken,
//   //   userId: order.userId,
//   //   idempotencyKey: order.id // or a dedicated key
//   // });
//   // if (remoteStatus === 200 || remoteStatus === 201) {
//   //   // immediate result
//   //   if (data.success && data.status === "paid") {
//   //     order.paymentInfo = { ...order.paymentInfo, status: "paid", transactionId: data.transactionId };
//   //     order.status = "paid";
//   //   } else {
//   //     order.paymentInfo = { ...order.paymentInfo, status: data.status || "failed", reason: data.reason };
//   //     order.status = "pending";
//   //   }
//   //   await order.save();
//   //   return res.json(order);
//   // }

//   // if (remoteStatus === 202) {
//   //   // accepted for async processing. Keep order pending; NATS will update when event published
//   //   order.paymentInfo = { ...order.paymentInfo, status: "pending", transactionId: data.transactionId || null };
//   //   order.status = "pending";
//   //   await order.save();
//   //   return res.status(202).json({ message: "Payment processing", order });
//   // }

//   // // remoteStatus === 0 or other code => treat as error
//   // order.paymentInfo = { ...order.paymentInfo, status: "failed", reason: data.reason || "payment-service-unavailable" };
//   // order.status = "pending";

//   // //////////////////////////
//   const paymentResult = {
//     success: true,
//     transactionId: "328173923jsjcscy2y12739",
//     status: "paid",
//   };

//   if (paymentResult.success) {
//     order.paymentInfo.status = "paid";
//     order.paymentInfo.transactionId = paymentResult.transactionId;
//     order.status = "paid";
//   } else {
//     order.paymentInfo.status = "failed";
//     order.status = "pending";
//     order.paymentInfo.reason = paymentResult.reason;
//   }

//   await order.save();
//   res.json(order);
// });

// GET all orders for logged-in user
app.get("/", authenticate, async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { page = 1, limit = 10, status } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    // Base filter (always by user)
    const where = { userId };

    // Only apply status filter if it’s provided and not "all"
    if (status && status.toLowerCase() !== "all") {
      where.status = status;
    }

    // Fetch paginated results
    const { count: total, rows: orders } = await Order.findAndCountAll({
      where,
      limit: limitNumber,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Convert numeric string fields to numbers (for Postgres NUMERIC types)
    const formattedOrders = orders.map((order) => ({
      ...order.toJSON(),
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      shippingFee: Number(order.shippingFee),
    }));

    // // added timeout to check loading states in frontend
    // setTimeout(() => {
    //   console.log("timeout");
    //    // Respond with clean pagination format
    //    return res.json({
    //     // role: role || "user",
    //     page: pageNumber,
    //     limit: limitNumber,
    //     total,
    //     totalPages: Math.ceil(total / limitNumber),
    //     orders: formattedOrders,
    //   });
    // }, 10000);

    // Respond with clean pagination format
    return res.json({
      // role: role || "user",
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});
// GET all orders for All users for Admin
// GET all orders for all users (Admin) with search & sorting
app.get("/admin/orders", authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.user;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "DESC",
      search,
    } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const where = {};

    // Status filter
    if (status && status.toLowerCase() !== "all") {
      where.status = status;
    }
    //  Search filter: orderNumber or shippingInfo.firstName/lastName
    if (search) {
      const searchTerm = `%${search}%`;
      console.log(searchTerm);

      where[Op.or] = [
        { orderNumber: { [Op.iLike]: searchTerm } },
        Sequelize.where(
          Sequelize.cast(Sequelize.json("shippingInfo.firstName"), "TEXT"),
          { [Op.iLike]: searchTerm }
        ),
        Sequelize.where(
          Sequelize.cast(Sequelize.json("shippingInfo.lastName"), "TEXT"),
          { [Op.iLike]: searchTerm }
        ),
      ];
    }

    // Fetch paginated results with optional user join for email search
    const { count: total, rows: orders } = await Order.findAndCountAll({
      where,

      limit: limitNumber,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    // Convert numeric fields
    const formattedOrders = orders.map((order) => ({
      ...order.toJSON(),
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      shippingFee: Number(order.shippingFee),
    }));

    return res.json({
      role: role || "admin",
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// app.get("/admin/orders/", authenticate, requireAdmin,async (req, res) => {
//   try {
//     const { id: userId, role } = req.user;
//     const { page = 1, limit = 10, status } = req.query;

//     const pageNumber = Number(page) || 1;
//     const limitNumber = Number(limit) || 10;
//     const offset = (pageNumber - 1) * limitNumber;

//     // Base filter (always by user)
//     // const where = { userId };
//     // const where = { };

//     // Only apply status filter if it’s provided and not "all"
//     if (status && status.toLowerCase() !== "all") {
//       where.status = status;
//     }

//     // Fetch paginated results
//     const { count: total, rows: orders } = await Order.findAndCountAll({
//       where,
//       limit: limitNumber,
//       offset,
//       order: [["createdAt", "DESC"]],
//     });

//     // Convert numeric string fields to numbers (for Postgres NUMERIC types)
//     const formattedOrders = orders.map((order) => ({
//       ...order.toJSON(),
//       subtotal: Number(order.subtotal),
//       total: Number(order.total),
//       shippingFee: Number(order.shippingFee),
//     }));

//     // Respond with clean pagination format
//     return res.json({
//       // role: role || "user",
//       page: pageNumber,
//       limit: limitNumber,
//       total,
//       totalPages: Math.ceil(total / limitNumber),
//       orders: formattedOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     return res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// app.get("/", authenticate, async (req, res) => {
//   const { id: userId } = req.user;
//   const { page = 1, limit = 10, status } = req.query;
//   const where = { userId };
//   if (status) where.status = status;

//   const orders = await Order.findAll({
//     where,
//     limit: +limit,
//     offset: (page - 1) * limit,
//     order: [["createdAt", "DESC"]],
//   });

//   res.json(orders);
// });

// GET single order
app.get("/:id", authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const order = await Order.findOne({ where: { id: req.params.id, userId } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({
    ...order.toJSON(), // or order if using Sequelize
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    shippingFee: Number(order.shippingFee),
  });
  // res.json(order);
});
app.get("/admin/:id", authenticate, requireAdmin, async (req, res) => {
  // const { id: userId } = req.user;
  const order = await Order.findOne({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({
    ...order.toJSON(), // or order if using Sequelize
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    shippingFee: Number(order.shippingFee),
  });
  // res.json(order);
});

app.patch(
  "/admin/orders/:orderId/status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "paid",
      "failed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "fulfilled",
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const order = await Order.findOne({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    // if (status === "fulfilled") {
    //   // Decrement stock via Product service
    //   for (const item of order.items) {
    //     await post("products", `/${item.productId}/decrement`, {
    //       quantity: item.quantity,
    //     });
    //   }
    // }
    // ^ commenting decrement logic, because now it's been handled via NATS message broker.

    // Emit event to NATS
    await emit("order.status.updated", {
      orderId,
      status,
    });

    res.json(order);
  }
);

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

async function registerEvents() {
  try {
    const response = await fetch(`${MESSAGE_BROKER_URL}/register-subscriber`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: "order-service",
        topics: ["payment.success", "payment.failed", "inventory.low"],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to register: ${response.status} ${response.statusText}`
      );
    }

    console.log("✅ Order Service registered with Message Broker");
  } catch (error) {
    console.error("❌ Failed to register Order Service:", error.message);
  }
}

async function startServer() {
  await connectDB();
  await sequelize.sync(); // ensures table creation
  app.listen(PORT, async () => {
    console.log(`🛒 Order Service running on port ${PORT}`);
    // await registerService(SERVICE_NAME, PORT);
    // registerEvents();
    // startSubscriber();
    await registerService().then(justConnectNATS);
    await new Promise(r => setTimeout(r, 500)); // small delay helps stabilize connection
    await drainOutbox();
    await setupEventSubscriptions();
  });
}

startServer();
