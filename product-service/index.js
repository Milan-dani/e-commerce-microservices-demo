require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const upload = require("./middleware/upload");
const Product = require("./models/Product");
const registerService = require("./serviceRegistry/registerService");
const { authenticate, requireAdmin } = require("./middleware/authMiddleware");

const app = express();
app.use(express.json());

// app.use('/uploads', express.static('uploads'));
// Serve static uploads folder so frontend can access images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3002;
const SERVICE_NAME = process.env.SERVICE_NAME || "products";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/products";

const productImagePlaceholder = "product-image-placeholder.png";

// Dynamic registration
registerService(SERVICE_NAME, PORT);

// Middleware to Check JWT and Admin Role
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
function getFullImageUrl(req, imagePath) {
  if (!imagePath) return null;

  // Only prepend host if it's a relative path starting with /uploads
  if (imagePath.startsWith("/uploads")) {
    return `${req.protocol}://${req.get("host")}${imagePath}`;
  }

  // Already a full URL, return as-is
  return imagePath;
}

// CRUD endpoints

app.post(
  "/products",
  authenticate,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const product = await Product.create(productData);
      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }
);

// app.post('/products', async (req, res) => {
//   try {
//     const product = await Product.create(req.body);
//     // TODO: Publish product.updated event
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

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
// app.get('/products', async (req, res) => {
//   try {
//     const {
//       search,
//       category,
//       page = 1,
//       limit = 10,
//       minPrice,
//       maxPrice,
//       inStock,
//       isNewProduct,
//       onSale,
//       sortBy,
//     } = req.query;

//     const query = {};

//     if (search) query.name = { $regex: search, $options: 'i' };
//     if (category) query.category = { $in: category.split(',') };
//     if (inStock === 'true') query.inStock = true;
//     if (isNewProduct === 'true') query.isNewProduct = true;
//     if (onSale === 'true') query.$expr = { $lt: ['$price', '$originalPrice'] };

//     if (minPrice || maxPrice) {
//       query.price = {};
//       if (minPrice) query.price.$gte = Number(minPrice);
//       if (maxPrice) query.price.$lte = Number(maxPrice);
//     }

//     // Pagination
//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);

//     // Count total
//     const total = await Product.countDocuments(query);

//     // Sorting
//     let sortOption = {};
//     switch (sortBy) {
//       case 'price-low':
//         sortOption.price = 1;
//         break;
//       case 'price-high':
//         sortOption.price = -1;
//         break;
//       case 'rating':
//         sortOption.rating = -1;
//         break;
//       case 'newest':
//         sortOption.dateAdded = -1;
//         break;
//       default:
//         sortOption._id = 1; // featured/default
//     }

//     const products = await Product.find(query)
//       .sort(sortOption)
//       .skip((pageNumber - 1) * limitNumber)
//       .limit(limitNumber);

//     res.json({
//       page: pageNumber,
//       limit: limitNumber,
//       total,
//       totalPages: Math.ceil(total / limitNumber),
//       products,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// GET /products — both user and admin

app.get("/products", async (req, res) => {
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
      status,
    } = req.query;

    const query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    // if (category && category !== 'all') query.category = category;
    if (category && category !== "all")
      query.category = { $in: category.split(",") };

    if (inStock === "true") query.inStock = true;
    if (isNewProduct === "true") query.isNewProduct = true;
    if (onSale === "true") query.$expr = { $lt: ["$price", "$originalPrice"] };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Detect admin via JWT
    let userRole = "guest";
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        userRole = decoded.role || "customer";
      } catch {
        // Ignore invalid token — treat as guest
      }
    }

    // Additional filters for admin
    if (userRole === "admin" && status && status !== "all") {
      switch (status) {
        case "active":
          query.status = "active";
          break;
        case "inactive":
          query.status = "inactive";
          break;
        case "low_stock":
          query.stock = { $lte: 10, $gt: 0 };
          break;
        case "out_of_stock":
          // query.stock = 0;
          query.inStock = false;
          break;
      }
    }
    // else if (userRole !== 'admin') {
    //   // Clients see only active, in-stock products
    //   query.isActive = true;
    //   query.stock = { $gt: 0 };
    // }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting logic
    let sortOption = {};
    switch (sortBy) {
      case "price-low":
        sortOption.price = 1;
        break;
      case "price-high":
        sortOption.price = -1;
        break;
      case "rating":
        sortOption.rating = -1;
        break;
      case "newest":
        sortOption.createdAt = -1;
        break;
      default:
        sortOption._id = 1;
    }

    const total = await Product.countDocuments(query);
    const productsWithStaticImageUrl = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Map through products to update image URLs
    const protocol = req.protocol;
    const host = req.get("host");
    const products = productsWithStaticImageUrl.map((product) => {
      if (product.image) {
        product.image = getFullImageUrl(req, product.image);
      }
      return product;
    });

    // Return different response shapes
    if (userRole === "admin") {
      // Add computed status label
      const adminProducts = products.map((p) => ({
        ...p,
        statusLabel:
          p.stock === 0
            ? "out_of_stock"
            : p.stock <= 10
            ? "low_stock"
            : p.isActive
            ? "active"
            : "inactive",
      }));

      return res.json({
        role: "admin",
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        products: adminProducts,
      });
    }
    // // Delay for testing
    // setTimeout(() => {
    //   console.log("timeout");
    //   // Regular user response
    //   return res.json({
    //     role: "user",
    //     page: pageNumber,
    //     limit: limitNumber,
    //     total,
    //     totalPages: Math.ceil(total / limitNumber),
    //     products,
    //   });
    // }, 10000);
    // Regular user response
      return res.json({
        role: "user",
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        products,
      });
  } catch (err) {
    console.error("Product Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to fetch unique categories
app.get("/categories", async (req, res) => {
  try {
    // Use distinct to get unique category values
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  if (product.image) {
    product.image = getFullImageUrl(req, product.image);
  }
  res.json(product);
});

// app.put("/products/:id", async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     // TODO: Publish product.updated event
//     if (!product) return res.status(404).json({ error: "Not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
app.put(
  "/products/:id",
  authenticate,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      // --- Image handling ---
      if (req.file) {
        // Case 1: new image uploaded

        if (product.image) {
          // if it's placeholder image do nothing.
          if (product.image !== `/uploads/${productImagePlaceholder}`) {
            const oldImagePath = path.join(__dirname, product.image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
          }
        }
        product.image = `/uploads/${req.file.filename}`;
      } else if (req.body.image === "") {
        // Case 2: user removed image

        if (product.image) {
          // if it's placeholder image do nothing.
          if (product.image !== `/uploads/${productImagePlaceholder}`);
          {
            const oldImagePath = path.join(__dirname, product.image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
          }
        }
        // product.image = null;
        product.image = `/uploads/${productImagePlaceholder || ""}-XXXXX`;
      } else if (typeof req.body.image === "string") {
        // Case 3: keep existing image — do nothing
      }

      // --- Dynamically update fields ---
      Object.keys(req.body).forEach((key) => {
        // Skip image because it's handled above
        if (key === "image") return;

        // Skip protected fields
        if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return;

        // Update field
        product[key] = req.body[key];
      });

      await product.save();
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }
);

app.delete("/products/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Delete associated image file if exists
    if (product.image) {
      // if it's placeholder image do nothing.
      if (product.image !== `/uploads/${productImagePlaceholder}`) {
        const imagePath = path.join(process.cwd(), product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product failed:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Decrement product quantity
app.post("/:id/decrement", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ error: "Quantity must be a positive number" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    // Decrement quantity
    product.quantity -= quantity;
    await product.save();

    res.json({ message: "Quantity decremented", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Product Service running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
