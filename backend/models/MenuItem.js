const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // For compatibility
  restaurantId: { type: String, required: true }, // Corresponds to User.id of the restaurant owner
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  type: { type: String, enum: ['veg', 'non-veg'], required: true },
  category: { type: String },
  emoji: { type: String, default: '🍲' },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
