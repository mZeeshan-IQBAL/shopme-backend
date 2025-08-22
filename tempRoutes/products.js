// backend/routes/products.js
const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /api/products - Get all products
router.get('/', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

module.exports = router;