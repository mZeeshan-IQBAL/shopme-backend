// backend/routes/topProducts.js
const express = require('express');
const router = express.Router();
const TopProduct = require('../models/topProduct');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { protect } = require('../middleware/auth'); // ✅ Import protect

// GET all top products - Public
router.get('/', async (req, res) => {
  try {
    const products = await TopProduct.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new top product - Protected
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadToCloudinary(req.file.path);

    const newProduct = new TopProduct({
      id: req.body.id,
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
    res.status(400).json({ error: err.message });
  }
});

// PUT update top product - Protected
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.img;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const updated = await TopProduct.findByIdAndUpdate(
      req.params.id,
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
    res.status(400).json({ error: err.message });
  }
});

// DELETE top product - Protected
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await TopProduct.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'TopProduct not found' });
    res.json({ message: 'TopProduct deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;