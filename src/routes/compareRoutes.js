// const express = require('express');
// const router = express.Router();
// const { getComparison } = require('../controllers/compareController');

// // GET /api/compare - Compare prices across platforms
// router.get('/', getComparison);

// // Also adding a POST route since standard HTTP clients might have trouble sending request body with GET
// router.post('/', getComparison);

// module.exports = router;


const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/compare?product=<name>&city=<city>&lat=<lat>&lon=<lon>
router.get('/', async (req, res) => {
  const { product, lat = 28.6139, lon = 77.2090 } = req.query; // Defaulting to Delhi coords
  
  if (!product) {
    return res.status(400).json({ success: false, error: 'Product query is required' });
  }

  try {
    // Calling the real QuickCommerce Group Search endpoint
    const response = await axios.get(`https://api.quickcommerceapi.com/v1/groupsearch`, {
      params: { 
        q: product, 
        lat: lat, 
        lon: lon, 
        platforms: 'BlinkIt,Zepto,Swiggy' // Must match their exact supported casing
      },
      headers: { 'X-API-Key': process.env.QUICK_COMMERCE_API_KEY }
    });

    const apiData = response.data;

    if (apiData.status !== 'success') {
      throw new Error('API returned an unsuccessful status');
    }

    // Format the response to map exactly what the React Native app expects
    const platformsData = ['BlinkIt', 'Zepto', 'Swiggy'].map(platform => ({
      platform: platform.toLowerCase(),
      // Safely access the results array for each platform; if empty or null, return empty array
      data: apiData.data.results[platform] || [] 
    }));

    const comparisonData = {
      item: product,
      platforms: platformsData,
      creditsRemaining: apiData.credits_remaining // Optional: pass to frontend for debugging
    };

    res.json({ success: true, data: comparisonData });
  } catch (err) {
    console.error('Error during real-time comparison:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ 
      success: false, 
      error: err?.response?.data?.message || 'Failed to fetch comparison data' 
    });
  }
});

module.exports = router;
