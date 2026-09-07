const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Keeping existing UUID based ID for compatibility
  role: { type: String, enum: ['customer', 'restaurant'], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Restaurant specific fields
  restaurantName: { type: String },
  city: { type: String },
  cuisine: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
