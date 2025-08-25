// backend/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { protectAdmin } = require('../middleware/protectAdmin'); // ✅ Use protectAdmin

// ===============================
// GET all products - Public
// ===============================
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET single product by custom `id` - Public
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const product = await Product.findOne({ id });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// POST new product - Admin Only
// ===============================
router.post('/', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const newProduct = new Product({
      id: parseInt(req.body.id),
      img: imageUrl,
      title: req.body.title,
      rating: parseFloat(req.body.rating),
      color: req.body.color,
      price: parseFloat(req.body.price),
      aosDelay: req.body.aosDelay
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===============================
// PUT update product by custom `id` - Admin Only
// ===============================
router.put('/:id', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    let imageUrl = req.body.img;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const updated = await Product.findOneAndUpdate(
      { id },
      {
        img: imageUrl,
        title: req.body.title,
        rating: parseFloat(req.body.rating),
        color: req.body.color,
        price: parseFloat(req.body.price),
        aosDelay: req.body.aosDelay
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===============================
// DELETE product by custom `id` - Admin Only
// ===============================
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const deleted = await Product.findOneAndDelete({ id });

    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;