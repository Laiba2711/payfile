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

// Middleware
// 1) Security HTTP headers
app.use(helmet());

// 2) Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3) CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
};
app.use(cors(corsOptions));

// 4) Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 5) Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 6) Prevent parameter pollution
app.use(hpp());


// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // Configure Bitcart store (auto-approve payouts, etc.)
      // Runs in background — safe if Bitcart is not yet ready (retries 5x)
      setupBitcartStore().catch((err) =>
        console.error('Bitcart setup error:', err.message)
      );
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);


module.exports = app;

