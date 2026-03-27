const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// POST /api/cart/add
// Adds an item to the Universal Cart
router.post('/add', async (req, res) => {
  const { userId, productName, quantity, preferredPlatform, prices, imageUrl } = req.body;

  try {
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productName === productName);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += (quantity || 1);
    } else {
      cart.items.push({ productName, quantity: quantity || 1, preferredPlatform, prices, imageUrl });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ success: true, message: 'Item added to Universal Cart', cart });
  } catch (err) {
    console.error('Cart Add Error:', err);
    res.status(500).json({ success: false, error: 'Failed to add item to cart' });
  }
});

// GET /api/cart/:userId/optimize
// The Optimization Engine (Greedy Algorithm for Cost Minimization)
router.get('/:userId/optimize', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart || cart.items.length === 0) {
      return res.json({ success: true, message: 'Cart is empty', data: null });
    }

    const DELIVERY_FEE = 25; // Assumed standard delivery fee per platform

    // 1. Initialize totals for Single-Platform Checkouts
    let platformTotals = { blinkit: 0, zepto: 0, swiggy: 0 };
    let platformMissingItems = { blinkit: [], zepto: [], swiggy: [] };

    // 2. Initialize variables for the "Smart Split" (Optimized) approach
    let smartSplitCart = [];
    let smartSplitTotal = 0;
    let platformsUsedInSplit = new Set();

    cart.items.forEach(item => {
      // --- Calculate Single Platform Totals ---
      ['blinkit', 'zepto', 'swiggy'].forEach(platform => {
        const price = item.prices[platform];
        if (price) {
          platformTotals[platform] += price * item.quantity;
        } else {
          platformMissingItems[platform].push(item.productName);
        }
      });

      // --- Calculate Smart Split (Greedy Heuristic) ---
      // If user selected a specific platform, force it. Otherwise, find the lowest price.
      let bestPlatform = item.preferredPlatform !== 'auto' ? item.preferredPlatform : null;
      let lowestPrice = bestPlatform ? item.prices[bestPlatform] : Infinity;

      if (!bestPlatform) {
        ['blinkit', 'zepto', 'swiggy'].forEach(platform => {
          if (item.prices[platform] && item.prices[platform] < lowestPrice) {
            lowestPrice = item.prices[platform];
            bestPlatform = platform;
          }
        });
      }

      if (bestPlatform && lowestPrice !== Infinity) {
        smartSplitCart.push({
          productName: item.productName,
          platform: bestPlatform,
          price: lowestPrice,
          quantity: item.quantity,
          itemTotal: lowestPrice * item.quantity
        });
        smartSplitTotal += lowestPrice * item.quantity;
        platformsUsedInSplit.add(bestPlatform);
      }
    });

    // 3. Add delivery fees to totals
    ['blinkit', 'zepto', 'swiggy'].forEach(platform => {
      if (platformTotals[platform] > 0) platformTotals[platform] += DELIVERY_FEE;
    });
    
    // Split cart gets charged multiple delivery fees based on how many platforms are used
    const splitDeliveryFees = platformsUsedInSplit.size * DELIVERY_FEE;
    const finalSmartSplitTotal = smartSplitTotal + splitDeliveryFees;

    // 4. Construct the Final Output
    const optimizationResult = {
      singlePlatforms: {
        blinkit: { total: platformTotals.blinkit, missingItems: platformMissingItems.blinkit },
        zepto: { total: platformTotals.zepto, missingItems: platformMissingItems.zepto },
        swiggy: { total: platformTotals.swiggy, missingItems: platformMissingItems.swiggy }
      },
      aiOptimizedSplit: {
        description: "Lowest per-item prices factoring in multiple delivery fees",
        total: finalSmartSplitTotal,
        deliveryFees: splitDeliveryFees,
        platformsToOrderFrom: Array.from(platformsUsedInSplit),
        items: smartSplitCart
      }
    };

    res.json({ success: true, data: optimizationResult });
  } catch (err) {
    console.error('Optimization Error:', err);
    res.status(500).json({ success: false, error: 'Failed to optimize cart' });
  }
});

// DELETE /api/cart/:userId/clear
router.delete('/:userId/clear', async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.params.userId });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = router;
