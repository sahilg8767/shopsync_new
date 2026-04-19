//====================================================================================================================================================

// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// const getComparison = async (req, res) => {
//     const productQuery = req.query.product || req.body.product;
//     const lat = req.query.lat || req.body.lat || 28.6139;
//     const lon = req.query.lon || req.body.lon || 77.2090;

//     if (!productQuery) {
//         return res.status(400).json({ success: false, error: 'Product query is required' });
//     }

//     try {
//         console.log(`Searching QuickCommerce for: ${productQuery}`);
        
//         // Securely pull API key, checking multiple common naming conventions
//         const apiKey = process.env.QUICKCOMMERCEAPIKEY || process.env.QUICKCOMMERCE_API_KEY || process.env.QUICK_COMMERCE_API_KEY;
        
//         if (!apiKey) {
//             console.error("API Key missing on Vercel environment");
//             return res.status(500).json({ success: false, error: 'API Key missing on Vercel' });
//         }

//         const config = { headers: { 'X-API-Key': apiKey }, timeout: 10000 };

//         // Make 3 parallel requests using standard search
//         const [blinkitRes, zeptoRes, swiggyRes] = await Promise.allSettled([
//             axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: productQuery, lat, lon, platform: 'BlinkIt' }, ...config }),
//             axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: productQuery, lat, lon, platform: 'Zepto' }, ...config }),
//             axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: productQuery, lat, lon, platform: 'Swiggy' }, ...config })
//         ]);

//         // Safely extract results, guarding against undefined data structures
//         const blinkitResults = blinkitRes.status === 'fulfilled' && blinkitRes.value.data?.status === 'success' 
//             ? blinkitRes.value.data.data.products : [];
            
//         const zeptoResults = zeptoRes.status === 'fulfilled' && zeptoRes.value.data?.status === 'success' 
//             ? zeptoRes.value.data.data.products : [];
            
//         const swiggyResults = swiggyRes.status === 'fulfilled' && swiggyRes.value.data?.status === 'success' 
//             ? swiggyRes.value.data.data.products : [];

//         // Extract target weight
//         let targetWeight = null;
//         let baselineItem = blinkitResults[0] || zeptoResults[0] || swiggyResults[0];

//         if (baselineItem) {
//             targetWeight = baselineItem.quantity || baselineItem.weight || baselineItem.packsize; 
//         }

//         // Fuzzy Weight Matcher (Allow up to 15% difference in pack sizes)
//         const filterByWeight = (results) => {
//             if (!results || results.length === 0) return [];
//             if (!targetWeight) return [results[0]]; 
            
//             const targetNormal = String(targetWeight).toLowerCase().replace(/\s/g, '');
//             const targetNum = parseFloat(targetNormal); 
            
//             let matchingItem = results.find(item => {
//                 const itemWeight = String(item.quantity || item.weight || item.packsize || '').toLowerCase().replace(/\s/g, '');
//                 return itemWeight === targetNormal;
//             });

//             if (!matchingItem && !isNaN(targetNum)) {
//                 matchingItem = results.find(item => {
//                     const itemWeight = String(item.quantity || item.weight || item.packsize || '').toLowerCase().replace(/\s/g, '');
//                     const itemNum = parseFloat(itemWeight);
                    
//                     if (!isNaN(itemNum)) {
//                         const diff = Math.abs(targetNum - itemNum);
//                         return diff <= (targetNum * 0.15);
//                     }
//                     return false;
//                 });
//             }

//             if (!matchingItem) matchingItem = results[0];

//             return [matchingItem]; 
//         };

//         const platformsData = [
//             { platform: 'blinkit', data: filterByWeight(blinkitResults) },
//             { platform: 'zepto', data: filterByWeight(zeptoResults) },
//             { platform: 'swiggy', data: filterByWeight(swiggyResults) }
//         ];

//         const comparisonData = {
//             item: productQuery,
//             targetWeight: targetWeight ? String(targetWeight) : 'Unknown',
//             platforms: platformsData,
//             creditsRemaining: blinkitRes.value?.data?.credits_remaining || zeptoRes.value?.data?.credits_remaining || 'Unknown' 
//         };

//         res.json({ success: true, data: comparisonData });

//     } catch (err) {
//         console.error('Comparison Error:', err.message);
//         res.status(500).json({ success: false, error: 'Internal Server Error fetching comparison' });
//     }
// };

// router.get('/', getComparison);
// router.post('/', getComparison);

// module.exports = router;



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
        console.log(`Searching QuickCommerce for: ${productQuery}`);
        
        const apiKey = process.env.QUICKCOMMERCEAPIKEY || process.env.QUICKCOMMERCE_API_KEY || process.env.QUICK_COMMERCE_API_KEY;
        const config = { headers: { 'X-API-Key': apiKey }, timeout: 10000 };

        const [blinkitRes, zeptoRes, swiggyRes] = await Promise.allSettled([
            axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: productQuery, lat, lon, platform: 'BlinkIt' }, ...config }),
            axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: productQuery, lat, lon, platform: 'Zepto' }, ...config }),
            axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: productQuery, lat, lon, platform: 'Swiggy' }, ...config })
        ]);

        const blinkitResults = blinkitRes.status === 'fulfilled' && blinkitRes.value.data?.status === 'success' ? blinkitRes.value.data.data.products : [];
        const zeptoResults = zeptoRes.status === 'fulfilled' && zeptoRes.value.data?.status === 'success' ? zeptoRes.value.data.data.products : [];
        const swiggyResults = swiggyRes.status === 'fulfilled' && swiggyRes.value.data?.status === 'success' ? swiggyRes.value.data.data.products : [];

        let targetWeight = null;
        let baselinePrice = null;
        let baselineItem = blinkitResults[0] || zeptoResults[0] || swiggyResults[0];

        if (baselineItem) {
            targetWeight = baselineItem.quantity || baselineItem.weight || baselineItem.packsize; 
            baselinePrice = parseFloat(baselineItem.offer_price || baselineItem.mrp || baselineItem.price || 0);
        }

        // --- ULTRA-SMART MATCHING (Segregating Singles & Combos) ---
        const filterSmart = (results) => {
            if (!results || results.length === 0) return [];
            if (!targetWeight || !baselinePrice) return [results[0]]; 
            
            const targetNormal = String(targetWeight).toLowerCase().replace(/\s/g, '');
            const targetNum = parseFloat(targetNormal); 

            let bestSingleMatch = null;
            let bestComboMatch = null;

            for (let item of results) {
                const itemWeight = String(item.quantity || item.weight || item.packsize || '').toLowerCase().replace(/\s/g, '');
                const itemNum = parseFloat(itemWeight);
                const itemPrice = parseFloat(item.offer_price || item.mrp || item.price || 0);

                // Check Weight (Exact or 15% Fuzzy)
                let isWeightMatch = (itemWeight === targetNormal);
                if (!isWeightMatch && !isNaN(targetNum) && !isNaN(itemNum)) {
                    const diff = Math.abs(targetNum - itemNum);
                    isWeightMatch = diff <= (targetNum * 0.15);
                }

                if (isWeightMatch && itemPrice > 0) {
                    const nameLower = String(item.name).toLowerCase();
                    const hasComboKeyword = nameLower.includes('pack of') || nameLower.includes('multipack') || nameLower.includes('combo');

                    // If price is > 2.5x baseline OR has a combo keyword, flag as a combo!
                    if (itemPrice > (baselinePrice * 2.5) || hasComboKeyword) {
                        if (!bestComboMatch) {
                            item.is_combo = true;
                            const estimatedPacks = Math.round(itemPrice / baselinePrice);
                            item.combo_estimate = estimatedPacks > 1 ? estimatedPacks : null;
                            bestComboMatch = item;
                        }
                    } 
                    // Otherwise, it's a valid single item
                    else if (itemPrice >= (baselinePrice * 0.3)) {
                        if (!bestSingleMatch) bestSingleMatch = item;
                    }
                }

                if (bestSingleMatch) break; // Found our ideal match, stop looking
            }

            // Prioritize Single Match. If only a Combo is available, return the Combo!
            if (bestSingleMatch) return [bestSingleMatch];
            if (bestComboMatch) return [bestComboMatch];

            return []; 
        };

        const platformsData = [
            { platform: 'blinkit', data: filterSmart(blinkitResults) },
            { platform: 'zepto', data: filterSmart(zeptoResults) },
            { platform: 'swiggy', data: filterSmart(swiggyResults) }
        ];

        const comparisonData = {
            item: productQuery,
            targetWeight: targetWeight ? String(targetWeight) : 'Unknown',
            platforms: platformsData,
            creditsRemaining: blinkitRes.value?.data?.credits_remaining || 'Unknown' 
        };

        res.json({ success: true, data: comparisonData });

    } catch (err) {
        console.error('Comparison Error:', err.message);
        res.status(500).json({ success: false, error: 'Internal Server Error fetching comparison' });
    }
};

router.get('/', getComparison);
router.post('/', getComparison);

module.exports = router;