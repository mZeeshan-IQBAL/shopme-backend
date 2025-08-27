// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Order = require('../models/order');
const { protectAdmin } = require('../middleware/protectAdmin');
const { protectUser } = require('../middleware/protectUser');

// ======================
// Nodemailer Setup
// ======================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  tls: { rejectUnauthorized: true },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 30000,
});

// Verify transporter once at startup
transporter.verify((err, success) => {
  if (err) {
    console.warn("⚠️ Email transporter not ready:", err.message);
  } else {
    console.log("✅ Email transporter ready");
  }
});

// ======================
// POST: Place new order
// ======================
router.post('/', async (req, res) => {
  const { name, email, address, items, userId } = req.body;

  if (!name || !email || !address || !items?.length) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  // Validate each item
  for (const item of items) {
    if (!item.id || !item.title || !item.price || !item.quantity || !item.img) {
      return res.status(400).json({ message: 'Invalid item in cart' });
    }
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Send confirmation email safely
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await transporter.sendMail({
        from: `"ShopMe" <${process.env.EMAIL_USER}>`,
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
      console.log("✅ Email sent successfully to", email);
    } catch (err) {
      console.error("📧 Email error:", err.message);
    }
  } else {
    console.log("⚠️ Skipping email: EMAIL_USER/PASS not set");
  }

  // Save order to database
  try {
    const order = new Order({ name, email, address, items, totalPrice, userId: userId || null });
    const savedOrder = await order.save();
    console.log("📦 Order saved to DB:", savedOrder._id);

    return res.status(201).json({
      message: "Order placed and saved successfully!",
      orderId: savedOrder._id,
    });
  } catch (dbError) {
    console.error("💾 DB save error:", dbError.message);
    return res.status(500).json({ message: "Order failed to save", error: dbError.message });
  }
});

// ======================
// GET: All orders (Admin)
// ======================
router.get('/', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("💾 Error fetching orders:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// GET: Orders by User ID (Customer)
// ======================
router.get('/user/:userId', protectUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. Cannot view another user’s orders.' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("💾 Error fetching user orders:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
