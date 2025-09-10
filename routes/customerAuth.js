// backend/routes/customerAuth.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetEmail } = require("../utils/emailService");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body; // extracting data from body coming from frontend

  //1. Basic validation
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  //2. Check if user already exists in database 
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    //3. Create new user if not exists
    const user = await User.create({ name, email, password });

    //4.Generate JWT token to authenticate user immediately after registration
    const token = jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ User registered:", user.email);

    //5. backend send back user data and token that frontend will store in local storage and on next request will send token in headers

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "user",
      },
    });
  } catch (err) {

    //6. Error handling for server issues

    console.error("❌ Registration error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // extracting data from body coming from frontend

  try {
    // 1. Find user by email in list of users saved in database and if not found return error
    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠️ Login failed: User not found for", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Check if password matches - we have method in user model to compare hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("⚠️ Login failed: Invalid password for", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate JWT token for authenticated user 
    const token = jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ User logged in:", user.email);

    // 4. Send back user data and token that frontend will store in local storage and on next request will send token in headers
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "user",
      },
    });
  } catch (err) {
    // 5. Error handling for server issues
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      return res.json({ ...user._doc, role: "user" });
    }

    return res.status(404).json({ error: "User not found" });
  } catch (err) {
    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ error: "Invalid token" });
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ error: "Token expired" });

    console.error("❌ Auth error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("ℹ️ Forgot password: Email not found:", email);
      return res.json({
        message: "If your email is registered, you will receive a reset link.",
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    console.log("🔐 Generated reset token for:", email);

    // Save token and expiry
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log("💾 Reset token saved to DB");

    // Send email
    try {
      await sendResetEmail(email, token);
      console.log("✅ Reset email sent to:", email);
    } catch (emailError) {
      console.error("📧 Failed to send reset email:", emailError.message);
      // Still return success to avoid exposing user existence
    }

    res.json({
      message: "If your email is registered, you will receive a reset link.",
    });
  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("❌ Invalid or expired reset token:", token);
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired." });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("✅ Password reset successful for:", user.email);

    res.json({ message: "Your password has been reset successfully." });
  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
