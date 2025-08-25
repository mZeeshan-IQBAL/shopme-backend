// backend/models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log('🔐 Hashing password for:', this.email);
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Match password method with debug logs
userSchema.methods.matchPassword = async function (password) {
  console.log("🔍 matchPassword called with:", password);
  const result = await bcrypt.compare(password, this.password);
  console.log("📄 Stored hash:", this.password);
  console.log("✅ Password match result:", result);
  return result;
};

// ✅ MUST be at the end
module.exports = mongoose.model('User', userSchema);