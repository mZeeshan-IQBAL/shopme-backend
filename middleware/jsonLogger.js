// middleware/jsonLogger.js

const express = require("express");

// Custom JSON parser with raw body logging & validation
const jsonLogger = express.json({
  verify: (req, res, buf) => {
    try {
      const rawBody = buf.toString();

      // 📥 Log raw body for debugging
      console.log("📥 Raw Body:", rawBody);

      // Validate JSON
      JSON.parse(rawBody);
    } catch (err) {
      console.error("❌ Invalid JSON detected:", buf.toString());
      throw err; // This will trigger Express error handling
    }
  },
});

module.exports = jsonLogger;
