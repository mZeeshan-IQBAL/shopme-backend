// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

// Helper: Validate password strength
const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

// ================================
// ADMIN LOGIN
// POST /api/admin/login
// ================================
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: admin._id, email: admin.email, role: "admin" },
      message: "Admin login successful",
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ error: "Server error during admin login" });
  }
});

// ================================
// CUSTOMER REGISTRATION
// POST /api/auth/register
// ================================
router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: "user" },
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ================================
// CUSTOMER LOGIN
// POST /api/auth/login
// ================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log("🔐 Login attempt:", { email, password }); // ✅ Log raw input

  try {
    const user = await User.findOne({ email });
    console.log("🔍 Found user:", !!user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("📄 Stored hash:", user.password);
    const isMatch = await user.matchPassword(password);
    console.log("✅ Password match result:", isMatch); // ✅ Critical log

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

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
router.get("/auth/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ error: "Access denied. No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("email");
      if (user) return res.json({ id: user._id, email: user.email, role: "admin" });
    } else {
      user = await User.findById(decoded.id).select("-password");
      if (user) return res.json({ ...user._doc, role: "user" });
    }

    return res.status(404).json({ error: "User not found" });
  } catch (err) {
    if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Invalid token" });
    if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired" });

    console.error("Auth error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
