// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');

// // GET /api/products - Get all products
// router.get('/', async (req, res) => {
//     try {
//         const products = await Product.find({});
//         res.status(200).json(products);
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).json({ message: 'Server error fetching products' });
//     }
// });

// // GET /api/products/category/:category - Get products by category
// router.get('/category/:category', async (req, res) => {
//     try {
//         const category = req.params.category;
//         // Case-insensitive matching
//         const products = await Product.find({ category: new RegExp('^' + category + '$', 'i') });

//         if (products.length === 0) {
//             return res.status(404).json({ message: `No products found in category: ${category}` });
//         }

//         res.status(200).json(products);
//     } catch (error) {
//         console.error('Error fetching products by category:', error);
//         res.status(500).json({ message: 'Server error fetching products' });
//     }
// });

// // GET /api/products/:id - Get single product by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.id);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         res.status(200).json(product);
//     } catch (error) {
//         console.error('Error fetching product by ID:', error);
//         res.status(500).json({ message: 'Server error fetching product' });
//     }
// });

// module.exports = router;

//==========================Working Below


// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// // GET /api/products
// // Action: Temporarily fetches 6 products directly from QuickCommerce API
// // Bypasses MongoDB so you can build the React Native Home Screen immediately.
// router.get('/', async (req, res) => {
//   try {
//     // Search for a baseline category (e.g., 'snacks') on BlinkIt
//     const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
//       params: { 
//         q: 'snacks', 
//         lat: 28.6139, // Delhi
//         lon: 77.2090, 
//         platform: 'BlinkIt' 
//       },
//       headers: { 'X-API-Key': process.env.QUICK_COMMERCE_API_KEY }
//     });

//     if (response.data.status === 'success' && response.data.data.products) {
//       // Slice only the first 6 products to keep the response fast and light
//       const topProducts = response.data.data.products.slice(0, 6);

//       // Map them to match the exact Mongoose schema shape your frontend expects
//       const formattedProducts = topProducts.map(item => ({
//         _id: item.id || Math.random().toString(36).substr(2, 9), // Fake MongoDB ID
//         name: item.name,
//         brand: item.brand || 'Generic',
//         category: 'snacks',
//         weight: item.quantity,
//         mrp: item.mrp || item.offer_price,
//         imageUrl: item.images && item.images.length > 0 ? item.images[0] : '',
//         tags: ['snacks'],
//         inStock: item.available !== false,
//         lastUpdated: new Date()
//       }));

//       return res.json({ 
//         success: true, 
//         count: formattedProducts.length, 
//         data: formattedProducts 
//       });
//     } else {
//       return res.json({ success: true, count: 0, data: [] });
//     }
//   } catch (err) {
//     console.error('Error fetching live products:', err?.response?.data || err.message);
//     res.status(500).json({ success: false, error: 'Failed to fetch catalog directly from API' });
//   }
// });

// module.exports = router;

// =========================================================================================================================


// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// // GET /api/products?lat=<lat>&lon=<lon>
// router.get('/', async (req, res) => {
//   // Grab coordinates from the mobile app's request, fallback to Delhi if missing
//   const lat = req.query.lat || 28.6139;
//   const lon = req.query.lon || 77.2090;

//   console.log(`Fetching Home Screen catalog for Location: ${lat}, ${lon}`);

//   try {
//     const categories = ['snacks', 'dairy', 'beverages', 'fruits', 'vegetables'];

//     const fetchPromises = categories.map(async (category) => {
//       try {
//         const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
//           params: { q: category, lat: lat, lon: lon, platform: 'BlinkIt' },
//           headers: { 'X-API-Key': process.env.QUICK_COMMERCE_API_KEY }
//         });

//         if (response.data.status === 'success' && response.data.data.products) {
//           const topProducts = response.data.data.products.slice(0, 5);

//           return topProducts.map(item => ({
//             _id: item.id || Math.random().toString(36).substr(2, 9),
//             name: item.name,
//             brand: item.brand || 'Generic',
//             category: category, 
//             weight: item.quantity,
//             mrp: item.mrp || item.offer_price,
//             imageUrl: item.images && item.images.length > 0 ? item.images[0] : '',
//             tags: [category],
//             inStock: item.available !== false,
//             lastUpdated: new Date()
//           }));
//         }
//         return []; 
//       } catch (error) {
//         console.error(`Error fetching '${category}':`, error?.response?.data || error.message);
//         return []; 
//       }
//     });

//     const resultsArray = await Promise.all(fetchPromises);
//     const allProducts = resultsArray.flat();

//     return res.json({ 
//       success: true, 
//       count: allProducts.length, 
//       data: allProducts 
//     });

//   } catch (err) {
//     console.error('Error in multi-category fetch:', err.message);
//     res.status(500).json({ success: false, error: 'Failed to fetch catalog' });
//   }
// });

// module.exports = router;


// =========================================================================================================================


// productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Helper function to calculate distance between two coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

// GET /api/products -> Fetches localized, unique products from your DB
router.get('/', async (req, res) => {
    try {
        const userLat = parseFloat(req.query.lat) || 28.6139; // Default to Delhi
        const userLon = parseFloat(req.query.lon) || 77.2090;

        // Our Delhi NCR cached regions
        const regions = [
            { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
            { name: 'Noida', lat: 28.5355, lon: 77.3910 },
            { name: 'Greater Noida', lat: 28.4744, lon: 77.5040 }
        ];

        // Find the nearest region to the user's actual location
        let nearestRegion = regions[0].name;
        let minDistance = Infinity;

        for (let r of regions) {
            let dist = getDistanceFromLatLonInKm(userLat, userLon, r.lat, r.lon);
            if (dist < minDistance) {
                minDistance = dist;
                nearestRegion = r.name;
            }
        }

        // Fetch products ONLY for their nearest region from YOUR database (Costs 0 API tokens)
        // Using an aggregation pipeline to group by name and get unique items
        const products = await Product.aggregate([
            { $match: { region: nearestRegion } },
            { $group: { _id: "$name", doc: { $first: "$$ROOT" } } }, // Ensures Unique Names
            { $replaceRoot: { newRoot: "$doc" } },
            { $limit: 250 } // Limit to 250 items so the app doesn't lag
        ]);

        res.json({ 
            success: true, 
            count: products.length, 
            region: nearestRegion, 
            data: products 
        });

    } catch (err) {
        console.error('Error fetching cached products:', err.message);
        res.status(500).json({ success: false, error: 'Failed to fetch catalog' });
    }
});

// GET /api/products/category/:category -> Make sure your category route is also fast!
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.aggregate([
            { $match: { category: new RegExp(category, 'i') } },
            { $group: { _id: "$name", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            { $limit: 100 }
        ]);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

const syncProducts = require('../utils/syncProducts'); // Adjust path!

router.get('/force-sync', async (req, res) => {
    try {
        res.json({ message: "Sync started in background. Check your server console." });
        await syncProducts();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;