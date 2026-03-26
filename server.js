const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cron = require('node-cron');
const syncProducts = require('./src/utils/syncProducts');

dotenv.config();
console.log('MONGO_URI is:', process.env.MONGO_URI ? 'DEFINED' : 'UNDEFINED');
console.log('Current directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to parse URL-encoded bodies Support for form-data

// Database Connection
connectDB();

// Schedule daily product sync job (runs at 00:00 or midnight)
cron.schedule('0 0 * * *', () => {
  console.log('Executing scheduled background product sync...');
  syncProducts();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ocr', require('./src/routes/ocrRoutes'));
app.use('/api/compare', require('./src/routes/compareRoutes'));

app.get('/', (req, res) => {
  res.send('ShopSync Backend is running');
});

app.get('/api/debug-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    // Try a simple operation
    const User = require('./src/models/User');
    const count = await User.countDocuments();

    res.json({
      message: 'DB Connection Test',
      state: states[state] || state,
      userCount: count,
      env: {
        mongo_defined: !!process.env.MONGO_URI
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'DB Test Failed',
      error: error.message,
      stack: error.stack,
      env: {
        mongo_defined: !!process.env.MONGO_URI
      }
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
