// backend/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadToCloudinary(req.file.path);

    const newProduct = new Product({
      id: req.body.id,
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

// PUT update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.img;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
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

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;