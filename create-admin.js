// create-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  });

async function createAdmin() {
  try {
    // Check if admin already exists
    const existing = await Admin.findOne({ email: 'admin@shopme.com' });
    if (existing) {
      console.log('⚠️ Admin already exists:', existing.email);
      process.exit(0);
    }

    // Create new admin
    const admin = await Admin.create({
      email: 'admin@shopme.com',
      password: 'zeeshan123'  // Change this later!
    });

    console.log('🎉 Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: zeeshan123 (change in production!)');
    console.log('✅ You can now log in at /admin/login');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
}

// Run the function
createAdmin();