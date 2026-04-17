// const express = require('express');
// const router = express.Router();
// const { getComparison } = require('../controllers/compareController');

// // GET /api/compare - Compare prices across platforms
// router.get('/', getComparison);

// // Also adding a POST route since standard HTTP clients might have trouble sending request body with GET
// router.post('/', getComparison);

// module.exports = router;

// =========================================================================================================================

// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// // GET /api/compare?product=<name>&city=<city>&lat=<lat>&lon=<lon>
// router.get('/', async (req, res) => {
//   const { product, lat = 28.6139, lon = 77.2090 } = req.query; // Defaulting to Delhi coords
  
//   if (!product) {
//     return res.status(400).json({ success: false, error: 'Product query is required' });
//   }

//   try {
//     // Calling the real QuickCommerce Group Search endpoint
//     const response = await axios.get(`https://api.quickcommerceapi.com/v1/groupsearch`, {
//       params: { 
//         q: product, 
//         lat: lat, 
//         lon: lon, 
//         platforms: 'BlinkIt,Zepto,Swiggy' // Must match their exact supported casing
//       },
//       headers: { 'X-API-Key': process.env.QUICK_COMMERCE_API_KEY }
//     });

//     const apiData = response.data;

//     if (apiData.status !== 'success') {
//       throw new Error('API returned an unsuccessful status');
//     }

//     // Format the response to map exactly what the React Native app expects
//     const platformsData = ['BlinkIt', 'Zepto', 'Swiggy'].map(platform => ({
//       platform: platform.toLowerCase(),
//       // Safely access the results array for each platform; if empty or null, return empty array
//       data: apiData.data.results[platform] || [] 
//     }));

//     const comparisonData = {
//       item: product,
//       platforms: platformsData,
//       creditsRemaining: apiData.credits_remaining // Optional: pass to frontend for debugging
//     };

//     res.json({ success: true, data: comparisonData });
//   } catch (err) {
//     console.error('Error during real-time comparison:', err?.response?.data || err.message);
//     res.status(err?.response?.status || 500).json({ 
//       success: false, 
//       error: err?.response?.data?.message || 'Failed to fetch comparison data' 
//     });
//   }
// });

// module.exports = router;

// =========================================================================================================================


// compareRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const getComparison = async (req, res) => {
    const productQuery = req.query.product || req.body.product;
    const lat = req.query.lat || req.body.lat || 28.6139;
    const lon = req.query.lon || req.body.lon || 77.2090;

    if (!productQuery) {
        return res.status(400).json({ success: false, error: 'Product query is required' });
    }

    try {
        // Calling QuickCommerce Group Search endpoint
        const response = await axios.get('https://api.quickcommerceapi.com/v1/group/search', {
            params: {
                q: productQuery,
                lat: lat,
                lon: lon,
                platforms: 'BlinkIt,Zepto,Swiggy'
            },
            headers: { 'X-API-Key': process.env.QUICKCOMMERCE_API_KEY }
        });

        const apiData = response.data;
        if (apiData.status !== 'success') throw new Error('API returned an unsuccessful status');

        // Extract results
        const blinkitResults = apiData.data?.results?.BlinkIt || [];
        const zeptoResults = apiData.data?.results?.Zepto || [];
        const swiggyResults = apiData.data?.results?.Swiggy || [];

        // WE NEED EXACT WEIGHT MATCHING.
        // Step 1: Find the baseline target weight from the primary platform (e.g., BlinkIt)
        let targetWeight = null;
        let baselineItem = blinkitResults[0] || zeptoResults[0] || swiggyResults[0];

        if (baselineItem) {
            targetWeight = baselineItem.quantity || baselineItem.weight; // e.g. "50 g"
        }

        // Step 2: Filter all platform results so they STRICTLY match the target weight
        const filterByWeight = (results) => {
            if (!targetWeight) return results.length > 0 ? [results[0]] : [];
            
            const targetNormal = targetWeight.toLowerCase().replace(/\s/g, '');
            
            const matchingItem = results.find(item => {
                const itemWeight = (item.quantity || item.weight || '').toLowerCase().replace(/\s/g, '');
                return itemWeight === targetNormal;
            });

            return matchingItem ? [matchingItem] : []; // Return only exact matches or nothing
        };

        const platformsData = [
            { platform: 'blinkit', data: filterByWeight(blinkitResults) },
            { platform: 'zepto', data: filterByWeight(zeptoResults) },
            { platform: 'swiggy', data: filterByWeight(swiggyResults) }
        ];

        const comparisonData = {
            item: productQuery,
            targetWeight: targetWeight || 'Unknown',
            platforms: platformsData,
            creditsRemaining: apiData.credits_remaining
        };

        res.json({ success: true, data: comparisonData });

    } catch (err) {
        console.error('Error during real-time comparison:', err?.response?.data || err.message);
        res.status(err?.response?.status || 500).json({ 
            success: false, 
            error: err?.response?.data?.message || 'Failed to fetch comparison data' 
        });
    }
};

router.get('/', getComparison);
router.post('/', getComparison);

module.exports = router;