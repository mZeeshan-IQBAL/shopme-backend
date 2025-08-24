const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// ===============================
// Cloudinary Configuration
// ===============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===============================
// Multer Setup: Save to /uploads temp
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + name + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ===============================
// Function: Upload to Cloudinary
// ===============================
async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'shopme-products'
    });

    // ✅ Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url; // ✅ Return Cloudinary hosted URL
  } catch (err) {
    throw new Error('Cloudinary upload failed: ' + err.message);
  }
}

module.exports = { upload, uploadToCloudinary };
