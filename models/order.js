// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    address: {
      type: String,
      required: true,
      minlength: 10,
    },
    items: [
      {
        id: { type: Number, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        img: { type: String, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Optional: Add index for faster queries
orderSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);