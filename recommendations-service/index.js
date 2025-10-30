const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3007;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Suggest related products (mock logic)
app.post('/recommendations', async (req, res) => {
  const { productId, context } = req.body;
  // TODO: Use real product data and user context
  // For now, return mock recommendations
  res.json({ recommendations: [
    { productId: 'mock1', name: 'Related Product 1' },
    { productId: 'mock2', name: 'Related Product 2' }
  ] });
});

// Generate product description using Gemini API
app.post('/generate-description', async (req, res) => {
  const { name, category } = req.body;
  try {
    const prompt = `Write a marketing-style description for a product called ${name} in the category ${category}.`;
    const response = await axios.post(GEMINI_API_URL + `?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    const description = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No description generated.';
    res.json({ description });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate description', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Recommendation Service running on port ${PORT}`);
});
