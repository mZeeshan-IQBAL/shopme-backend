// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Order = require('../models/order');
const { protectAdmin } = require('../middleware/protectAdmin');
const { protectUser } = require('../middleware/protectUser');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Explicitly set secure options
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS (true for 465, false for 587)
  tls: {
    rejectUnauthorized: true, // Ensures valid SSL certificate
  },
  // Optional: Add connection timeout
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 30000,
});

// POST: Place new order (Public)
router.post('/', async (req, res) => {
  const { name, email, address, items, userId } = req.body;

  if (!name || !email || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  // Validate each item
  for (const item of items) {
    if (!item.id || !item.title || !item.price || !item.quantity || !item.img) {
      return res.status(400).json({ message: 'Invalid item in cart' });
    }
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Send confirmation email
  try {
    await transporter.sendMail({
      from: '"ShopMe" <zeshansos510@gmail.com>',
      to: email,
      subject: `Order Confirmed`,
      html: `
        <h2>🛍️ Hello, ${name}!</h2>
        <p>Your order has been confirmed.</p>
        <p><strong>Total:</strong> ₹${totalPrice}</p>
        <p>Shipping to: ${address}</p>
        <p>Thank you for shopping with us!</p>
      `,
    });
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("📧 Email error:", err);
    // Proceed anyway
  }

  // Save to DB
  try {
    const order = new Order({
      name,
      email,
      address,
      items,
      totalPrice,
      userId: userId || null
    });

    const savedOrder = await order.save();
    console.log("📦 Order saved to DB:", savedOrder._id);

    return res.status(201).json({
      message: "Order placed and saved successfully!",
      orderId: savedOrder._id,
    });
  } catch (dbError) {
    console.error("💾 DB save error:", dbError);
    return res.status(500).json({
      message: "Order failed to save in database",
      error: dbError.message,
    });
  }
});

// GET: All orders (Admin Only)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Orders by User ID (Customer Only)
router.get('/user/:userId', protectUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure token user matches requested userId
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. Cannot view another user’s orders.' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;