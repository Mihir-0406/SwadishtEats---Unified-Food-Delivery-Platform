const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Automatically delete session after 7 days
});

module.exports = mongoose.model('Session', SessionSchema);
