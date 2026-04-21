const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');

dotenv.config(); // ← MUST be first so all process.env vars are set before any require()

const { validateConfig } = require('./utils/configValidator');
const { setupBitcartStore } = require('./scripts/setupBitcart');

// Final production check
validateConfig();

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');
const saleRoutes = require('./routes/sale');
const purchaseRoutes = require('./routes/purchase');
const adminRoutes = require('./routes/admin');
const { startPayoutRetryJob } = require('./controllers/purchaseController');

// ── 1) Security HTTP headers ───────────────────────────────────────────────────
app.use(helmet());

// ── 2) Development logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── 3) CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5174').split(',').map(o => o.trim());
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// ── 4) Raw body capture for Bitcart webhook ────────────────────────────────────
// MUST be registered BEFORE express.json() so we can verify the HMAC signature
// against the exact bytes Bitcart sent (not a re-serialized JS object).
app.use('/api/purchases/bitcart-webhook', express.raw({ type: 'application/json' }));

// ── 5) Body parser (all other routes) ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── 6) Data sanitization against NoSQL query injection ────────────────────────
app.use(mongoSanitize());

// ── 7) Prevent parameter pollution ────────────────────────────────────────────
app.use(hpp());

// ── Main Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running', env: process.env.NODE_ENV });
});

// ── Catch undefined routes ────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ── Database Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      // Configure Bitcart store (auto-approve payouts, register webhook URL, verify wallets)
      setupBitcartStore().catch((err) =>
        console.error('Bitcart setup error:', err.message)
      );
      // Start background job that retries failed payouts every 5 minutes
      startPayoutRetryJob();
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
