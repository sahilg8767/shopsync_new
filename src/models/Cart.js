const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Can be device ID or logged-in user ID
  items: [{
    productName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    preferredPlatform: { type: String, default: 'auto' }, // 'blinkit', 'zepto', 'swiggy', or 'auto'
    imageUrl: { type: String },
    // Caching the prices so the optimizer can run instantly
    prices: {
      blinkit: { type: Number, default: null },
      zepto: { type: Number, default: null },
      swiggy: { type: Number, default: null }
    }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
