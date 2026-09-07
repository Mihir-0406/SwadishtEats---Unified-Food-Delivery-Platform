/* ============================================================
   routes/menu.js — Restaurant Menu Management API (MongoDB)
   ============================================================ */
'use strict';

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Session = require('../models/Session');

/* ── Auth middleware ─────────────────────────────────────── */
function requireAuth(role) {
  return async (req, res, next) => {
    try {
      const token = req.headers['authorization']?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ success: false, message: 'Auth required.' });

      const session = await Session.findOne({ token });
      if (!session) return res.status(401).json({ success: false, message: 'Session expired.' });

      const user = await User.findOne({ id: session.userId });
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      if (role && user.role !== role) {
        return res.status(403).json({ success: false, message: `Only ${role} allowed.` });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Auth error.' });
    }
  };
}

/* ── GET /api/menu/all ───────────────────────────────────── */
router.get('/all', async (req, res) => {
  try {
    const restaurants = await User.find({ role: 'restaurant' });
    const allItems = await MenuItem.find({ isAvailable: true });

    const result = restaurants.map(r => ({
      id: r.id,
      restaurantName: r.restaurantName,
      ownerName: r.name,
      city: r.city,
      cuisine: r.cuisine,
      avatar: '🏪',
      isApproved: true,
      items: allItems.filter(i => i.restaurantId === r.id).map(i => {
        let obj = i.toObject();
        // Frontend compatibility for isVeg toggle
        obj.isVeg = obj.type === 'veg'; 
        return obj;
      })
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[MENU ALL ERROR]', err);
    return res.status(500).json({ success: false, message: 'Could not fetch.' });
  }
});

/* ── GET /api/menu/:restaurantId ─────────────────────────── */
router.get('/:restaurantId', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
    return res.json({ success: true, data: items.map(i => {
      let obj = i.toObject();
      obj.isVeg = obj.type === 'veg';
      return obj;
    })});
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not fetch.' });
  }
});

/* ── POST /api/menu/item ─────────────────────────────────── */
router.post('/item', requireAuth('restaurant'), async (req, res) => {
  try {
    const { name, description, price, category, isVeg, emoji } = req.body;

    if (!name?.trim() || !price) {
      return res.status(400).json({ success: false, message: 'Name and price required.' });
    }

    const item = new MenuItem({
      id: uuidv4(),
      restaurantId: req.user.id,
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      type: (isVeg === true || isVeg === 'true') ? 'veg' : 'non-veg',
      category: category?.trim() || 'Main Course',
      emoji: emoji?.trim() || '🍽️',
      isAvailable: true
    });

    await item.save();
    let obj = item.toObject();
    obj.isVeg = obj.type === 'veg'; // Frontend compatibility

    return res.status(201).json({ success: true, message: 'Item added!', data: obj });
  } catch (err) {
    console.error('[MENU ADD ERROR]', err);
    return res.status(500).json({ success: false, message: 'Could not add item.' });
  }
});

/* ── PUT /api/menu/item/:itemId ──────────────────────────── */
router.put('/item/:itemId', requireAuth('restaurant'), async (req, res) => {
  try {
    const { name, description, price, category, isVeg, emoji, isAvailable } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category.trim();
    if (emoji) updateData.emoji = emoji.trim();
    if (isVeg !== undefined) updateData.type = (isVeg === true || isVeg === 'true') ? 'veg' : 'non-veg';
    if (isAvailable !== undefined) updateData.isAvailable = (isAvailable === true || isAvailable === 'true');

    const updated = await MenuItem.findOneAndUpdate(
      { id: req.params.itemId, restaurantId: req.user.id },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Not found.' });
    
    let obj = updated.toObject();
    obj.isVeg = obj.type === 'veg';
    
    return res.json({ success: true, message: 'Item updated!', data: obj });
  } catch (err) {
    console.error('[MENU UPDATE ERROR]', err);
    return res.status(500).json({ success: false, message: 'Could not update item.' });
  }
});

/* ── DELETE /api/menu/item/:itemId ───────────────────────── */
router.delete('/item/:itemId', requireAuth('restaurant'), async (req, res) => {
  try {
    const deleted = await MenuItem.findOneAndDelete({ id: req.params.itemId, restaurantId: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found.' });
    return res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not delete.' });
  }
});

module.exports = router;
