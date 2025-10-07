require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/products';


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

// get all Products without Pagination
// app.get('/products', async (req, res) => {
//   const { search, category } = req.query;
//   let query = {};
//   if (search) query.name = { $regex: search, $options: 'i' };
//   if (category) query.category = category;
//   const products = await Product.find(query);
//   res.json(products);
// });

// get all Products with Pagination
// app.get('/products', async (req, res) => {
//   try {
//     const { search, category, page = 1, limit = 10 } = req.query;

//     // Build query
//     let query = {};
//     if (search) query.name = { $regex: search, $options: 'i' };
//     if (category) query.category = category;

//     // Convert page & limit to numbers
//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);

//     // Count total matching products
//     const total = await Product.countDocuments(query);

//     // Fetch products with pagination
//     const products = await Product.find(query)
//       .skip((pageNumber - 1) * limitNumber)
//       .limit(limitNumber);

//     res.json({
//       page: pageNumber,
//       limit: limitNumber,
//       total,
//       totalPages: Math.ceil(total / limitNumber),
//       products
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// get all Products with Pagination, filters and sortBy
app.get('/products', async (req, res) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      inStock,
      isNewProduct,
      onSale,
      sortBy,
    } = req.query;

    const query = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = { $in: category.split(',') };
    if (inStock === 'true') query.inStock = true;
    if (isNewProduct === 'true') query.isNewProduct = true;
    if (onSale === 'true') query.$expr = { $lt: ['$price', '$originalPrice'] };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Count total
    const total = await Product.countDocuments(query);

    // Sorting
    let sortOption = {};
    switch (sortBy) {
      case 'price-low':
        sortOption.price = 1;
        break;
      case 'price-high':
        sortOption.price = -1;
        break;
      case 'rating':
        sortOption.rating = -1;
        break;
      case 'newest':
        sortOption.dateAdded = -1;
        break;
      default:
        sortOption._id = 1; // featured/default
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to fetch unique categories
app.get('/categories', async (req, res) => {
  try {
    // Use distinct to get unique category values
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
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
