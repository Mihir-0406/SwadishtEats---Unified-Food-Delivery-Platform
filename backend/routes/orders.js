/* ============================================================
   routes/orders.js — Orders API
   POST   /api/orders            — Customer places order
   GET    /api/orders/my         — Customer views their own orders
   GET    /api/orders/restaurant — Restaurant sees incoming orders
   PUT    /api/orders/:id/status — Restaurant updates order status
   ============================================================ */
'use strict';

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const Order   = require('../models/Order');
const Session = require('../models/Session');
const User    = require('../models/User');

/* ── Auth Middleware ─────────────────────────────────────── */
async function auth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Auth required.' });

  const session = await Session.findOne({ token });
  if (!session) return res.status(401).json({ success: false, message: 'Session expired.' });

  const user = await User.findOne({ id: session.userId });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  req.user = user;
  next();
}

/* ── POST /api/orders — Customer places an order ─────────── */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can place orders.' });
    }

    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Restaurant and items are required.' });
    }

    // Verify restaurant exists
    const restaurant = await User.findOne({ id: restaurantId, role: 'restaurant' });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = Math.round(subtotal * 0.05);
    const deliveryCharge = 20;
    const totalAmount = subtotal + gst + deliveryCharge;

    const order = new Order({
      id: 'SE' + Date.now().toString().slice(-8),
      customerId: req.user.id,
      restaurantId,
      items: items.map(i => ({
        itemId:   i.itemId || i.id,
        name:     i.name,
        price:    i.price,
        quantity: i.quantity,
        emoji:    i.emoji || '🍽️',
      })),
      totalAmount,
      status: 'pending',
      deliveryAddress: deliveryAddress || 'Mahuva',
      paymentMethod: paymentMethod || 'Cash on Delivery',
    });

    await order.save();

    console.log(`[ORDER] New order ${order.id} from ${req.user.name} @ ${restaurant.restaurantName}`);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        orderId: order.id,
        totalAmount,
        status: 'pending',
        estimatedTime: '25–35 minutes',
        restaurantName: restaurant.restaurantName,
      },
    });

  } catch (err) {
    console.error('[ORDERS CREATE ERROR]', err);
    return res.status(500).json({ success: false, message: 'Could not place order.' });
  }
});

/* ── GET /api/orders/my — Customer's own orders ─────────── */
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only for customers.' });
    }

    const orders = await Order.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Attach restaurant names
    const enriched = await Promise.all(orders.map(async (o) => {
      const rest = await User.findOne({ id: o.restaurantId });
      return {
        ...o.toObject(),
        restaurantName: rest?.restaurantName || 'Unknown Restaurant',
        restaurantAvatar: '🏪',
      };
    }));

    return res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('[ORDERS MY ERROR]', err);
    return res.status(500).json({ success: false, message: 'Could not fetch orders.' });
  }
});

/* ── GET /api/orders/restaurant — Restaurant's incoming orders ── */
router.get('/restaurant', auth, async (req, res) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ success: false, message: 'Only for restaurants.' });
    }

    const orders = await Order.find({ restaurantId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Attach customer names
    const enriched = await Promise.all(orders.map(async (o) => {
      const customer = await User.findOne({ id: o.customerId });
      return {
        ...o.toObject(),
        customerName: customer?.name || 'Customer',
        customerPhone: customer?.phone || '',
      };
    }));

    return res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('[ORDERS RESTAURANT ERROR]', err);
    return res.status(500).json({ success: false, message: 'Could not fetch orders.' });
  }
});

/* ── PUT /api/orders/:id/status — Restaurant updates status ── */
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ success: false, message: 'Only restaurants can update order status.' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id, restaurantId: req.user.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    console.log(`[ORDER] Status updated: ${order.id} → ${status}`);
    return res.json({ success: true, message: `Order marked as ${status}`, data: order });

  } catch (err) {
    console.error('[ORDER STATUS ERROR]', err);
    return res.status(500).json({ success: false, message: 'Could not update order.' });
  }
});

/* ── GET /api/orders/:id — Get single order (for tracking) ── */
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Auth: only owner customer or restaurant can view
    if (order.customerId !== req.user.id && order.restaurantId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const rest     = await User.findOne({ id: order.restaurantId });
    const customer = await User.findOne({ id: order.customerId });

    return res.json({
      success: true,
      data: {
        ...order.toObject(),
        restaurantName: rest?.restaurantName || 'Restaurant',
        customerName:   customer?.name || 'Customer',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not fetch order.' });
  }
});

module.exports = router;
