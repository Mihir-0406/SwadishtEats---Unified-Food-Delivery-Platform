const mongoose = require('mongoose');

const RestaurantRequestSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  ip: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RestaurantRequest', RestaurantRequestSchema);
