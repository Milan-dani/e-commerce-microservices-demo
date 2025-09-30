const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory';

// Inventory schema
const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  stock: { type: Number, required: true }
});
const Inventory = mongoose.model('Inventory', inventorySchema);

// Update stock after payment
app.post('/inventory/update', async (req, res) => {
  const { productId, quantity } = req.body;
  const inventory = await Inventory.findOne({ productId });
  if (!inventory) return res.status(404).json({ error: 'Product not found in inventory' });
  inventory.stock -= quantity;
  await inventory.save();
  // TODO: Publish stock.updated event
  res.json(inventory);
});

// Get inventory for product
app.get('/inventory/:productId', async (req, res) => {
  const inventory = await Inventory.findOne({ productId: req.params.productId });
  if (!inventory) return res.status(404).json({ error: 'Product not found in inventory' });
  res.json(inventory);
});

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Inventory Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
