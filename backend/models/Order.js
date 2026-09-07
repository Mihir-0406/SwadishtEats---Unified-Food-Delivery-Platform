const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // For compatibility
  customerId: { type: String, required: true }, // User.id
  restaurantId: { type: String, required: true }, // User.id
  items: [{
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    emoji: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
  deliveryAddress: { type: String },
  paymentMethod: { type: String, default: 'Cash on Delivery' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
