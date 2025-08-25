// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');  // For admin login
const User = require('../models/user');    // For customer auth
const jwt = require('jsonwebtoken');

// JWT Secret (must be set in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// ================================
// ADMIN LOGIN
// POST /api/admin/login
// ================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

    // Respond with token and admin info
    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      },
      message: 'Admin login successful'
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// ================================
// CUSTOMER REGISTRATION
// POST /api/auth/register
// ================================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    // Respond with token and user info
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user'
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ================================
// CUSTOMER LOGIN
// POST /api/auth/login
// ================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    // Respond with token and user info
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user'
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ================================
// GET /api/auth/me - Get Current User
// ================================
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    // Check if admin or user
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('email');
      if (user) {
        return res.json({ id: user._id, email: user.email, role: 'admin' });
      }
    } else {
      user = await User.findById(decoded.id).select('-password');
      if (user) {
        return res.json({ ...user._doc, role: 'user' });
      }
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;