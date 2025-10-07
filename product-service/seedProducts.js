require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Product = require('./models/Product');
// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/products';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function seedProducts(count = 20) {
  try {

    const products = [];

    for (let i = 0; i < count; i++) {
      const name = faker.commerce.productName();
      const price = parseFloat(faker.commerce.price({ min: 20, max: 500 }));
      const originalPrice = price + faker.number.float({ min: 10, max: 100 });
      const category = faker.commerce.department();
      const description = faker.commerce.productDescription();
      const image = faker.image.urlLoremFlickr({ category: 'product' });
      const rating = faker.number.float({ min: 3, max: 5, precision: 0.1 });
      const reviews = faker.number.int({ min: 10, max: 500 });
      const stock = faker.number.int({ min: 0, max: 100 });
      const inStock = stock > 0;
      const isNewProduct = faker.datatype.boolean();
      const status = 'active';

      products.push({
        name,
        price,
        originalPrice,
        image,
        description,
        category,
        status,
        rating,
        reviews,
        stock,
        inStock,
        isNewProduct,
        dateAdded: faker.date.past({ years: 1 }),
      });
    }

    await Product.deleteMany(); // Clear old data
    console.log('🗑️  Existing products removed');

    await Product.insertMany(products);
    console.log(`✅ Successfully inserted ${products.length} products`);
  } catch (err) {
    console.error('❌ Error seeding products:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

seedProducts(30); // Generate 30 fake products
