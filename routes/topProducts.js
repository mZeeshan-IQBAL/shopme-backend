// backend/routes/topProducts.js

const express = require('express');
const router = express.Router();
const topProducts = require('../data/topProducts');

// GET /api/top-products - Get all top products
router.get('/', (req, res) => {
  res.json(topProducts);
});

// GET /api/top-products/:id - Get single top product by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = topProducts.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Top product not found" });
  }

  res.json(product);
});

module.exports = router;