const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3004;
const POSTGRES_URI = process.env.POSTGRES_URI || 'postgres://postgres:password@localhost:5432/orders';

const sequelize = new Sequelize(POSTGRES_URI);

const Order = sequelize.define('Order', {
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  userId: { type: DataTypes.STRING, allowNull: false }
});

const OrderItem = sequelize.define('OrderItem', {
  productId: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false }
});

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

// Create order
app.post('/orders', async (req, res) => {
  const { userId, items } = req.body;
  try {
    const order = await Order.create({ userId });
    for (const item of items) {
      await OrderItem.create({ ...item, OrderId: order.id });
    }
    // TODO: Publish order.created event
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get orders for user
app.get('/orders/:userId', async (req, res) => {
  const orders = await Order.findAll({ where: { userId: req.params.userId }, include: OrderItem });
  res.json(orders);
});

// Update order status
app.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  await order.save();
  res.json(order);
});

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('PostgreSQL connection error:', err));
