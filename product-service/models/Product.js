const mongoose = require('mongoose');
// Product schema
// const productSchema = new mongoose.Schema({
//   name: String,
//   price: Number,
//   description: String,
//   stock: Number,
//   category: String
// });
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    isNewProduct: { type: Boolean, default: false },
    dateAdded: { type: Date, default: Date.now }
    });
  
    module.exports = mongoose.model('Product', productSchema);

  // const Product = mongoose.model('Product', productSchema);
  
  // export default Product;