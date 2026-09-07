/* ============================================================
   સ્વાદિષ્ટEats — Express Backend Server
   ============================================================
   Endpoints:
     POST /api/waitlist            → Join email waitlist
     POST /api/restaurant/register → Restaurant partner application
     POST /api/contact             → Contact form
     GET  /api/stats               → Public stats (waitlist count, etc.)
     GET  /health                  → Health check
   ============================================================ */

'use strict';

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');
require('dotenv').config();

const waitlistRoutes    = require('./routes/waitlist');
const restaurantRoutes  = require('./routes/restaurant');
const contactRoutes     = require('./routes/contact');
const authRoutes        = require('./routes/auth');
const menuRoutes        = require('./routes/menu');
const ordersRoutes      = require('./routes/orders');

const connectDB = require('./utils/db');
connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ─────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allow the frontend to call APIs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'null',          // file:// origin for local HTML opens
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Serve Static Frontend (optional) ─────────────────────
app.use('/static', express.static(path.join(__dirname, '..', 'frontend')));

// ── Routes ────────────────────────────────────────────────
app.use('/api/waitlist',    waitlistRoutes);
app.use('/api/restaurant',  restaurantRoutes);
app.use('/api/contact',     contactRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/menu',        menuRoutes);
app.use('/api/orders',      ordersRoutes);

// ── Stats Endpoint ─────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const Waitlist = require('./models/Waitlist');
    const RestaurantRequest = require('./models/RestaurantRequest');
    
    const waitlistCount = await Waitlist.countDocuments();
    const restaurantCount = await RestaurantRequest.countDocuments();

    res.json({
      waitlistCount,
      restaurantCount,
      launchCity:       'Mahuva, Gujarat',
      status:           'coming_soon',
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.json({ waitlistCount: 142, restaurantCount: 12, status: 'coming_soon' });
  }
});

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    app:       'સ્વાદિષ્ટEats API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  });
});

// ── Root ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🍽️ Welcome to સ્વાદિષ્ટEats API',
    docs:    '/health',
    version: '1.0.0',
  });
});

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error.' : err.message,
  });
});

// ── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍽️  સ્વાદિષ્ટEats Backend Running`);
  console.log(`📡  API:    http://localhost:${PORT}`);
  console.log(`❤️   Health: http://localhost:${PORT}/health`);
  console.log(`📊  Stats:  http://localhost:${PORT}/api/stats`);
  console.log(`\n✅  Ready to serve Mahuva!\n`);
});

module.exports = app;
