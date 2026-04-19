// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./src/config/db');
// const authRoutes = require('./src/routes/authRoutes');
// const productRoutes = require('./src/routes/productRoutes');
// const cron = require('node-cron');
// const syncProducts = require('./src/utils/syncProducts');

// dotenv.config();
// console.log('MONGO_URI is:', process.env.MONGO_URI ? 'DEFINED' : 'UNDEFINED');
// console.log('Current directory:', process.cwd());

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // Added to parse URL-encoded bodies Support for form-data

// // Database Connection
// connectDB();

// // Schedule daily product sync job (runs at 00:00 or midnight)
// cron.schedule('0 0 * * *', () => {
//   console.log('Executing scheduled background product sync...');
//   syncProducts();
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/ocr', require('./src/routes/ocrRoutes'));
// app.use('/api/compare', require('./src/routes/compareRoutes'));

// app.get('/', (req, res) => {
//   res.send('ShopSync Backend is running');
// });

// app.get('/api/debug-db', async (req, res) => {
//   try {
//     const mongoose = require('mongoose');
//     const state = mongoose.connection.readyState;
//     const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

//     // Try a simple operation
//     const User = require('./src/models/User');
//     const count = await User.countDocuments();

//     res.json({
//       message: 'DB Connection Test',
//       state: states[state] || state,
//       userCount: count,
//       env: {
//         mongo_defined: !!process.env.MONGO_URI
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'DB Test Failed',
//       error: error.message,
//       stack: error.stack,
//       env: {
//         mongo_defined: !!process.env.MONGO_URI
//       }
//     });
//   }
// });

// if (require.main === module) {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// module.exports = app;


// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const dns = require('node:dns'); // Required to fix querySrv ECONNREFUSED
// const connectDB = require('./src/config/db');
// const authRoutes = require('./src/routes/authRoutes');
// const productRoutes = require('./src/routes/productRoutes');
// const cron = require('node-cron');
// const syncProducts = require('./src/utils/syncProducts');

// dotenv.config();

// // Override DNS to resolve querySrv ECONNREFUSED errors for MongoDB
// dns.setServers(['8.8.8.8', '8.8.4.4']);

// console.log('MONGO_URI is:', process.env.MONGO_URI ? 'DEFINED' : 'UNDEFINED');
// console.log('Current directory:', process.cwd());

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // Support for form-data

// // Database Connection
// connectDB();

// // Schedule daily product sync job (runs at midnight)
// cron.schedule('0 0 * * *', () => {
//   console.log('Executing scheduled background product sync...');
//   syncProducts();
// });

// // Routes
// app.use('/api/auth', authRoutes); // Existing auth logic
// app.use('/api/products', productRoutes);
// app.use('/api/ocr', require('./src/routes/ocrRoutes'));
// app.use('/api/compare', require('./src/routes/compareRoutes'));
// app.use('/api/cart', require('./src/routes/cartRoutes')); // ADD THIS LINE


// app.get('/api/trigger-sync', async (req, res) => {
//   const syncProducts = require('./src/utils/syncProducts');
//   await syncProducts();
//   res.json({ message: 'Sync complete' });
// });


// // Health Checks
// app.get('/', (req, res) => {
//   res.send('ShopSync Backend is running');
// });

// app.get('/api/debug-db', async (req, res) => {
//   try {
//     const mongoose = require('mongoose');
//     const state = mongoose.connection.readyState;
//     const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

//     const User = require('./src/models/User');
//     const count = await User.countDocuments();

//     res.json({
//       message: 'DB Connection Test',
//       state: states[state] || state,
//       userCount: count,
//       env: { mongo_defined: !!process.env.MONGO_URI }
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'DB Test Failed',
//       error: error.message,
//       env: { mongo_defined: !!process.env.MONGO_URI }
//     });
//   }
// });

// if (require.main === module) {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// module.exports = app;


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('node:dns'); 
const connectDB = require('./src/config/db');
const cron = require('node-cron');

dotenv.config();

// Override DNS to resolve querySrv ECONNREFUSED errors for MongoDB
dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log('MONGO_URI is:', process.env.MONGO_URI ? 'DEFINED' : 'UNDEFINED');

const app = express();
const PORT = process.env.PORT || 5000;

// ROBUST CORS MIDDLEWARE - Crucial for React Native on Vercel
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'ngrok-skip-browser-warning']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Note: node-cron does NOT run in background on Vercel (serverless). 
// This will only run when testing locally. Use the /api/trigger-sync route for production.
if (process.env.NODE_ENV !== 'production') {
  cron.schedule('0 0 * * *', () => {
    console.log('Executing scheduled background product sync...');
    const syncProducts = require('./src/utils/syncProducts');
    syncProducts();
  });
}

// Routes
app.use('/api/auth', require('./src/routes/authRoutes')); 
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/ocr', require('./src/routes/ocrRoutes'));
app.use('/api/compare', require('./src/routes/compareRoutes'));

// Try-catch block just in case cartRoutes.js is missing/empty during deployment
try {
  app.use('/api/cart', require('./src/routes/cartRoutes')); 
} catch (e) {
  console.log('Cart routes not yet configured, skipping...');
}

// Sync Route
app.get('/api/trigger-sync', async (req, res) => {
  try {
    const syncProducts = require('./src/utils/syncProducts');
    await syncProducts();
    res.json({ message: 'Sync complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health Checks
app.get('/', (req, res) => {
  res.send('ShopSync Backend is running perfectly on Vercel!');
});

app.get('/api/debug-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    const User = require('./src/models/User');
    const count = await User.countDocuments();

    res.json({
      message: 'DB Connection Test',
      state: states[state] || state,
      userCount: count,
      env: { mongo_defined: !!process.env.MONGO_URI }
    });
  } catch (error) {
    res.status(500).json({
      message: 'DB Test Failed',
      error: error.message,
      env: { mongo_defined: !!process.env.MONGO_URI }
    });
  }
});

// Vercel Serverless Export Check
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;