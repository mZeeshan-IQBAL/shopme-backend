// middleware/auth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1]; // "Bearer token"

  if (!token) return res.status(401).json({ error: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = { protect };