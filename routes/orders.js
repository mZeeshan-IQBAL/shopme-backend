// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Order = require('../models/order'); // ✅ Import the Order model

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { name, email, address, items } = req.body;

  // Validate required fields
  if (!name || !email || !address || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Send confirmation email
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
    // Continue even if email fails (optional)
  }

  // ✅ Save order to MongoDB
  try {
    const order = new Order({
      name,
      email,
      address,
      items,
      totalPrice,
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

module.exports = router ;