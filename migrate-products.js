// migrate-products.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');
const TopProduct = require('./models/topProduct');

// Use actual Cloudinary URLs (from media library)
const cloudinaryUrls = {
  "Women Ethnic": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/women.png",
  "Women Western": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/women2.jpg",
  "Goggles": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/women3.jpg",
  "Printed T-Shirt": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/women4.jpg",
  "Fashion T-Shirt": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/women2.jpg", // same as Women Western
  "Casual Wear": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/shirt.png",
  "Printed Shirt": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/shirt2.png",
  "Women Shirt": "https://res.cloudinary.com/dwtieckqh/image/upload/v123456789/shirt3.png"
};

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Migrate regular products
    const productsData = require('./data/products');
    for (const item of productsData) {
      const imageUrl = cloudinaryUrls[item.title] || "https://via.placeholder.com/300x400";

      await Product.create({
        id: item.id,
        img: imageUrl,
        title: item.title,
        rating: item.rating,
        color: item.color,
        price: item.price,
        aosDelay: item.aosDelay
      });

      console.log(`✅ Saved: ${item.title}`);
    }

    // Migrate top products
    const topProductsData = require('./data/topProducts');
    for (const item of topProductsData) {
      const imageUrl = cloudinaryUrls[item.title] || "https://via.placeholder.com/300x400";

      await TopProduct.create({
        id: item.id,
        img: imageUrl,
        title: item.title,
        rating: item.rating,
        description: item.description,
        price: item.price,
        aosDelay: item.aosDelay
      });

      console.log(`✅ Saved: ${item.title}`);
    }

    console.log('🎉 All products saved with real Cloudinary URLs!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

migrate();