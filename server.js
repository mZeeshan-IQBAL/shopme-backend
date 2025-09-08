// server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

// Import custom middlewares
const corsMiddleware = require("./middlewares/corsMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MongoDB Connection
// ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ DB connection error:", err));

// ======================
// Middlewares
// ======================
app.use(corsMiddleware); // ✅ Using custom CORS middleware

app.use(
  express.json({
    verify: (req, res, buf) => {
      try {
        console.log("📥 Raw Body:", buf.toString());
        JSON.parse(buf.toString());
      } catch (err) {
        console.error("❌ Invalid JSON detected:", buf.toString());
        throw err;
      }
    },
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================
// API Routes
// ======================
app.use("/api/products", require("./routes/products"));
app.use("/api/top-products", require("./routes/topProducts"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/api/auth", require("./routes/customerAuth"));

// ======================
// Health Check / Root
// ======================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("🛍️ Fashion Store Backend is running ✅");
});

// ======================
// 404 & Error Handling
// ======================
app.use((req, res) => {
  res.status(404).json({
    message:
      "Route not found. Check /api/products, /api/top-products, or /api/orders",
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack || err.message);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

// ======================
// Start Server
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running at http://0.0.0.0:${PORT}`);
  console.log(`📦 Products API: /api/products`);
  console.log(`👕 Top Products API: /api/top-products`);
  console.log(`🧾 Orders API: /api/orders`);
  console.log(`🔐 Admin Login: /api/admin/login`);
  console.log(`👤 Customer Auth: /api/auth/register, /api/auth/login`);
  console.log(`🖼️ Uploads: /uploads/shirt/shirt.png (example)`);
});
