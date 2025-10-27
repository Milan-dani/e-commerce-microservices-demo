require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const registerService = require("./serviceRegistry/registerService");
const User = require('./models/User');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SERVICE_NAME = process.env.SERVICE_NAME || "auth";
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth';

// Dynamic registration
registerService(SERVICE_NAME, PORT);


// Signup
app.post('/signup', async (req, res) => {
  const {firstName, lastName, username, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ firstName, lastName, username, email, password: hash, role });
    // Create a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.status(201).json({ message: 'User created', user: { firstName, lastName, username, email, role }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// test
app.post('/', async (req, res) => {
  res.send("Auth Service is running");
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
   // Convert to plain JS object and remove password
   const { password: _, ...userWithoutPassword } = user.toObject();
  res.json({ message: 'Login Successful', user: userWithoutPassword, token })
  // res.json({ token });
});

// JWT validation
app.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    res.json({ user });
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
