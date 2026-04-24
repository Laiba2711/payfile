const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');

dotenv.config(); // ← MUST be first so all process.env vars are set before any require()

const { validateConfig } = require('./utils/configValidator');
const { setupBitcartStore } = require('./scripts/setupBitcart');
const prisma = require('./prisma/client');

validateConfig();

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');
const saleRoutes = require('./routes/sale');
const purchaseRoutes = require('./routes/purchase');
const adminRoutes = require('./routes/admin');
const { startPayoutRetryJob, startPendingPurchaseCleanupJob } = require('./controllers/purchaseController');

// ── Security HTTP headers ────────────────────────────────────────────────────
app.use(helmet());

// ── Request logging ──────────────────────────────────────────────────────────
app.use(process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined'));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5174').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// ── Raw body capture for Bitcart webhook ─────────────────────────────────────
// MUST be registered BEFORE express.json() so we can verify the HMAC signature
// against the exact bytes Bitcart sent (not a re-serialized JS object).
app.use('/api/purchases/bitcart-webhook', express.raw({ type: 'application/json' }));

// ── Body parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── HPP (param pollution) ────────────────────────────────────────────────────
app.use(hpp());

// ── Main Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running', env: process.env.NODE_ENV });
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// ── Startup ──────────────────────────────────────────────────────────────────
(async () => {
  try {
    // Verify Prisma can actually reach Neon before we bind the port.
    // Schema migrations are run by `prisma migrate deploy` in the npm start command.
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to Postgres (Neon) via Prisma');
  } catch (err) {
    console.error('❌ Postgres connection error:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    // Configure Bitcart store (auto-approve payouts, register webhook URL, verify wallets)
    setupBitcartStore().catch((err) => console.error('Bitcart setup error:', err.message));
    // Background jobs
    startPayoutRetryJob();
    startPendingPurchaseCleanupJob();
  });
})();

// Clean shutdown — close Prisma's pool so Neon doesn't hold stale connections.
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
