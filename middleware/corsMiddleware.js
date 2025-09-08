// middlewares/corsMiddleware.js
const cors = require("cors");

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

console.log("🌐 Allowed Origins from .env/Default:", allowedOrigins);

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Postman, curl, mobile apps
    if (allowedOrigins.includes(origin)) {
      console.log("✅ Allowed:", origin);
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // ✅ Added PATCH
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

module.exports = corsMiddleware;

