/* ============================================================
   routes/auth.js — Authentication Routes (MongoDB)
   ============================================================ */
'use strict';

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { hashPassword, verifyPassword } = require('../utils/hash');
const User = require('../models/User');
const Session = require('../models/Session');

/* ── POST /api/auth/register ─────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const {
      role, name, email, phone, password,
      restaurantName, city, cuisine
    } = req.body;

    if (!['customer', 'restaurant'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    if (role === 'restaurant' && !restaurantName?.trim()) {
      return res.status(400).json({ success: false, message: 'Restaurant name required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const userId = uuidv4();
    const user = new User({
      id: userId,
      role,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.replace(/\s|-/g, ''),
      password: hashPassword(password),
      restaurantName: role === 'restaurant' ? restaurantName.trim() : null,
      city: role === 'restaurant' ? (city?.trim() || 'Mahuva') : null,
      cuisine: role === 'restaurant' ? (cuisine?.trim() || 'Multi-cuisine') : null,
    });

    await user.save();

    const token = uuidv4();
    await new Session({ token, userId }).save();

    console.log(`[AUTH] New ${role} registered: ${cleanEmail}`);

    return res.status(201).json({
      success: true,
      message: `Welcome to સ્વાદિષ્ટEats, ${user.name}!`,
      token,
      user: safeUser(user),
    });

  } catch (err) {
    console.error('[AUTH REGISTER ERROR]', err);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

/* ── POST /api/auth/login ────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = uuidv4();
    await new Session({ token, userId: user.id }).save();

    console.log(`[AUTH] Login: ${cleanEmail}`);
    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser(user),
    });

  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

/* ── GET /api/auth/me ────────────────────────────────────── */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token.' });

    const session = await Session.findOne({ token });
    if (!session) return res.status(401).json({ success: false, message: 'Session expired.' });

    const user = await User.findOne({ id: session.userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Session check failed.' });
  }
});

/* ── POST /api/auth/logout ───────────────────────────────── */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (token) {
      await Session.deleteOne({ token });
    }
    return res.json({ success: true, message: 'Logged out.' });
  } catch {
    return res.json({ success: true, message: 'Logged out.' });
  }
});

function safeUser(user) {
  const obj = user.toObject();
  delete obj.password;
  delete obj._id;
  delete obj.__v;
  // Make avatar dynamically available for frontend compatibility
  obj.avatar = obj.role === 'customer' ? '👤' : '🏪';
  return obj;
}

module.exports = router;
