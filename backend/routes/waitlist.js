/* ============================================================
   routes/waitlist.js — Email Waitlist API (MongoDB)
   ============================================================ */
'use strict';

const express = require('express');
const router  = express.Router();
const Waitlist = require('../models/Waitlist');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const existing = await Waitlist.findOne({ email: cleaned });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You're already on the waitlist! 🎉",
      });
    }

    const record = new Waitlist({
      name: 'Waitlist User', // Waitlist form on landing only has email, so we provide default name
      email: cleaned,
      city: 'Mahuva',
      ip: req.ip
    });

    await record.save();
    const count = await Waitlist.countDocuments();

    console.log(`[WAITLIST] New signup: ${cleaned} (Total: ${count})`);

    return res.status(201).json({
      success: true,
      message: "You're on the list! 🎉 We'll notify you when we launch.",
      count,
    });

  } catch (err) {
    console.error('[WAITLIST ERROR]', err);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await Waitlist.countDocuments();
    res.json({ success: true, count });
  } catch {
    res.json({ success: true, count: 0 });
  }
});

module.exports = router;
