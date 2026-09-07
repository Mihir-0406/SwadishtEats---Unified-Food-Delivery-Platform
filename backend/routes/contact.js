/* ============================================================
   routes/contact.js — Contact Form API (MongoDB)
   ============================================================ */
'use strict';

const express = require('express');
const router  = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email, message required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be 10+ characters.' });
    }

    const record = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      message: message.trim(),
      ip: req.ip
    });

    // Subject wasn't in schema originally, ignored or add to schema. (We'll omit it as we didn't define it in the model)

    await record.save();
    console.log(`[CONTACT] New message from ${record.name}`);

    return res.status(201).json({
      success: true,
      message: `Thank you, ${record.name}! We'll respond soon.`,
    });
  } catch (err) {
    console.error('[CONTACT ERROR]', err);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

router.get('/messages', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== (process.env.ADMIN_KEY || 'swadisheats-admin-2024')) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch {
    res.status(500).json({ success: false, message: 'Could not fetch messages.' });
  }
});

module.exports = router;
