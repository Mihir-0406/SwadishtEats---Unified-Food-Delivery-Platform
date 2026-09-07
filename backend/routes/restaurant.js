/* ============================================================
   routes/restaurant.js — Restaurant Partner Registration API (MongoDB)
   ============================================================ */
'use strict';

const express = require('express');
const router  = express.Router();
const RestaurantRequest = require('../models/RestaurantRequest');

router.post('/register', async (req, res) => {
  try {
    const { ownerName, phone, restaurantName, email, city, cuisine } = req.body;

    const missing = [];
    if (!ownerName?.trim())      missing.push('ownerName');
    if (!phone?.trim())          missing.push('phone');
    if (!restaurantName?.trim()) missing.push('restaurantName');
    if (!city?.trim())           missing.push('city');

    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
    }

    const cleanPhone = phone.replace(/\s|-/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Invalid Indian mobile number.' });
    }

    const existing = await RestaurantRequest.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Phone number already registered.' });
    }

    const record = new RestaurantRequest({
      ownerName: ownerName.trim(),
      phone: cleanPhone,
      restaurantName: restaurantName.trim(),
      email: email?.trim().toLowerCase() || 'no-email@provided.com', // fallback
      city: city.trim(),
      cuisine: cuisine?.trim() || 'Not specified',
      ip: req.ip
    });

    await record.save();
    const count = await RestaurantRequest.countDocuments();

    console.log(`[RESTAURANT] New application: ${record.restaurantName} — Total: ${count}`);

    return res.status(201).json({
      success: true,
      message: `Thank you, ${record.ownerName}! Application received.`,
      applicationId: record._id,
    });

  } catch (err) {
    console.error('[RESTAURANT ERROR]', err);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

router.get('/list', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== (process.env.ADMIN_KEY || 'swadisheats-admin-2024')) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  try {
    const restaurants = await RestaurantRequest.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch {
    res.status(500).json({ success: false, message: 'Could not fetch data.' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await RestaurantRequest.countDocuments();
    const approved = await RestaurantRequest.countDocuments({ status: 'approved' });
    const pending = await RestaurantRequest.countDocuments({ status: 'pending' });

    res.json({ success: true, total, approved, pending });
  } catch {
    res.json({ success: true, total: 0, approved: 0, pending: 0 });
  }
});

module.exports = router;
