// server.js
require("dotenv").config(); // ✅ Load .env first

console.log("🔧 ENV DEBUG:");
console.log("  CLIENT_URL:", process.env.CLIENT_URL);
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT:", process.env.PORT);

const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

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
// Use CLIENT_URL from .env if available, otherwise fallback to hardcoded list
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // React dev server
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (e.g., curl, mobile apps, tests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS: ", origin);
        return callback(new Error("Not allowed by CORS policy"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable if using cookies/sessions
  })
);

app.use(express.json());

// ======================
// Serve Static Files
// ======================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================
// API Routes
// ======================
app.use("/api/products", require("./routes/products"));
app.use("/api/top-products", require("./routes/topProducts"));
app.use("/api/orders", require("./routes/orders"));

// ======================
// Health Check / Home Route
// ======================
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
      <h1>🛍️ Fashion Store Backend</h1>
      <p>Backend is running smoothly ✅</p>
      <div style="margin-top: 30px;">
        <h3>Available APIs:</h3>
        <ul style="list-style: none; padding: 0; display: inline-block; text-align: left;">
          <li><a href="/api/products">GET /api/products</a></li>
          <li><a href="/api/top-products">GET /api/top-products</a></li>
          <li><a href="/api/orders">GET /api/orders</a></li>
        </ul>
      </div>
      <div style="margin-top: 30px; color: #555;">
        <small>🖼️ Images served from /uploads</small>
      </div>
    </div>
  `);
});

// ======================
// 404 Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    message:
      "Route not found. Check /api/products, /api/top-products, or /api/orders",
  });
});

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// ======================
// Start Server
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running at http://0.0.0.0:${PORT}`);
  console.log(`📦 Products API: /api/products`);
  console.log(`👕 Top Products API: /api/top-products`);
  console.log(`🧾 Orders API: /api/orders`);
  console.log(`🖼️ Uploads: /uploads/shirt/shirt.png (example)`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`);
});