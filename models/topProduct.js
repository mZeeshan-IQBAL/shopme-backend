const mongoose = require('mongoose');

const topProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  img: String,
  rating: Number,
  description: String,
  price: Number,
  aosDelay: String
});

module.exports = mongoose.model('TopProduct', topProductSchema);