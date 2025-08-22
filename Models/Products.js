// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  img: { type: String, required: true }, // You can store the image URL or path
  rating: { type: Number, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  aosDelay: { type: String }, // optional
});

module.exports = mongoose.model("Product", productSchema);
