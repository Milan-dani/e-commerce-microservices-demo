const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/products';

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  stock: Number,
  category: String
});
const Product = mongoose.model('Product', productSchema);

// CRUD endpoints
app.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    // TODO: Publish product.updated event
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/products', async (req, res) => {
  const { search, category } = req.query;
  let query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  const products = await Product.find(query);
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // TODO: Publish product.updated event
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  // TODO: Publish product.updated event
  res.json({ message: 'Deleted' });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Product Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
