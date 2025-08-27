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
let transporter;

// Only initialize transporter if credentials are set
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    tls: {
      rejectUnauthorized: true, // Prevent MITM attacks
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });

  // Verify transporter on startup
  transporter.verify((err, success) => {
    if (err) {
      console.warn("⚠️ Email transporter not ready:", err.message);
    } else {
      console.log("✅ Email transporter ready: Gmail SMTP connected");
    }
  });
} else {
  console.log("📧 Email disabled: EMAIL_USER or EMAIL_PASS not set");
}

// ======================
// POST: Place new order
// ======================
router.post('/', async (req, res) => {
  const { name, email, address, items, userId } = req.body;

  // Validate required fields
  if (!name || !email || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Missing required fields: name, email, address, or valid items array'
    });
  }

  // Validate each item
  for (const item of items) {
    if (!item.id || !item.title || !item.price || !item.quantity || !item.img) {
      return res.status(400).json({
        message: `Invalid item in cart: missing fields for item ID ${item.id}`
      });
    }
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number' || item.quantity < 1) {
      return res.status(400).json({
        message: `Invalid price or quantity for item: ${item.title}`
      });
    }
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Send confirmation email (if configured)
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"ShopMe" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🛍️ Order Confirmed`,
        html: `
          <h2>Hello, ${name}!</h2>
          <p>Your order has been confirmed. Thank you for shopping with us!</p>
          <p><strong>Total:</strong> ₹${totalPrice.toLocaleString()}</p>
          <p>📦 Shipping to: ${address}</p>
          <p>We'll notify you when your order ships.</p>
        `,
      });
      console.log("✅ Email sent successfully to", email);
    } catch (err) {
      console.error("📧 Failed to send email:", err.message);
      // Continue — don't block order on email failure
    }
  } else {
    console.log("📧 Skipping email: transporter not configured");
  }

  // Save order to database
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

    // ✅ Success response
    return res.status(201).json({
      message: "Order placed and saved successfully!",
      orderId: savedOrder._id,
      success: true
    });
  } catch (dbError) {
    console.error("💾 DB save error:", dbError.message);
    return res.status(500).json({
      message: "Order failed to save in database",
      error: dbError.message,
      success: false
    });
  }
});

// ======================
// GET: All orders (Admin Only)
// ======================
router.get('/', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("💾 Error fetching all orders:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// GET: Orders by User ID (Customer Only)
// ======================
router.get('/user/:userId', protectUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own orders
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied. Cannot view another user’s orders.'
      });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("💾 Error fetching user orders:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;