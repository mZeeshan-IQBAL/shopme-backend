// backend/routes/topProducts.js
const express = require('express');
const router = express.Router();
const TopProduct = require('../models/topProduct');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { protectAdmin } = require('../middleware/protectAdmin');

// ===============================
// GET all top products - Public
// ===============================
router.get('/', async (req, res) => {
  try {
    const products = await TopProduct.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET single top product by custom `id` - Public
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const product = await TopProduct.findOne({ id });
    if (!product) return res.status(404).json({ error: 'TopProduct not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// POST new top product - Admin Only
// ===============================
router.post('/', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const newProduct = new TopProduct({
      id: parseInt(req.body.id),
      img: imageUrl,
      title: req.body.title,
      rating: parseFloat(req.body.rating),
      description: req.body.description,
      price: parseFloat(req.body.price),
      aosDelay: req.body.aosDelay
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating top product:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ===============================
// PUT update top product by custom `id` - Admin Only
// ===============================
router.put('/:id', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    let imageUrl = req.body.img;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const updated = await TopProduct.findOneAndUpdate(
      { id },
      {
        img: imageUrl,
        title: req.body.title,
        rating: parseFloat(req.body.rating),
        description: req.body.description,
        price: parseFloat(req.body.price),
        aosDelay: req.body.aosDelay
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'TopProduct not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating top product:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ===============================
// DELETE top product by custom `id` - Admin Only
// ===============================
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const deleted = await TopProduct.findOneAndDelete({ id });

    if (!deleted) return res.status(404).json({ error: 'TopProduct not found' });
    res.json({ message: 'TopProduct deleted' });
  } catch (err) {
    console.error('Error deleting top product:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;