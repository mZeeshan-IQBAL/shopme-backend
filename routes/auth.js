// routes/auth.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

// JWT Secret (add to .env)
// JWT_SECRET=your-super-secret-key-change-in-production
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;