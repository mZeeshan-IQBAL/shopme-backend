const mongoose = require('mongoose');

const topProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  img: { type: String, required: true }, // Cloudinary URL
  title: { type: String, required: true },
  rating: { type: Number, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  aosDelay: { type: String }
});

module.exports = mongoose.model('TopProduct', topProductSchema);