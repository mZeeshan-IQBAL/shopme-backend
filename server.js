// server.js 
require('dotenv').config(); // ✅ Load .env at the top

const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MongoDB Connection
// ======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ DB connection error:", err));

// ======================
// Middleware
// ======================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // ✅ Allow frontend on Railway or fallback
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ======================
// Serve Static Files
// ======================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// API Routes
// ======================
app.use('/api/products', require('./Routes/products'));
app.use('/api/top-products', require('./Routes/topProducts'));
app.use('/api/orders', require('./Routes/orders'));

// ======================
// Health Check / Home Route
// ======================
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
      <h1>🛍️ Fashion Store Backend</h1>
      <p>Backend is running smoothly ✅</p>
      <div style="margin-top: 30px;">
        <h3>Available APIs:</h3>
        <ul style="list-style: none; padding: 0; display: inline-block;">
          <li><a href="/api/products">GET /api/products</a></li>
          <li><a href="/api/top-products">GET /api/top-products</a></li>
        </ul>
      </div>
      <div style="margin-top: 30px; color: #555;">
        <small>🖼️ Images served from /uploads</small>
      </div>
    </div>
  `);
});

// ======================
// 404 Handler - Catch All
// ======================
app.use('', (req, res) => {
  res.status(404).json({ 
    message: "Route not found. Check /api/products or /api/top-products" 
  });
});

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`👕 Top Products API: http://localhost:${PORT}/api/top-products`);
  console.log(`🖼️  Uploads: http://localhost:${PORT}/uploads/shirt/shirt.png (example)`);

  console.log("📧 Email User:", process.env.EMAIL_USER);
  console.log("🔑 Email Password Loaded:", !!process.env.EMAIL_PASS);
});
