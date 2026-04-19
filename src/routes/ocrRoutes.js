// const express = require('express');
// const router = express.Router();

// // POST /api/ocr -> Receives OCR text, parses product name/weight, and redirects to /api/compare
// router.post('/', async (req, res) => {
//     const { ocrText, city } = req.body;

//     if (!ocrText) {
//         return res.status(400).json({ success: false, error: 'OCR text is required' });
//     }

//     try {
//         // 1. Clean up OCR Text
//         const lines = ocrText.split('\n')
//             .map(line => line.trim())
//             .filter(line => line.length > 2); // Ignore single characters/noise

//         if (lines.length === 0) {
//             return res.status(400).json({ success: false, error: 'Could not parse a valid product name from OCR' });
//         }

//         // 2. Extract Weight (e.g., 500g, 1kg, 200ml) using Regex
//         let detectedWeight = '';
//         const weightRegex = /(\d+)\s*(g|kg|ml|l|ltr|pcs|pack)/i;
        
//         for (const line of lines) {
//             const match = line.match(weightRegex);
//             if (match) {
//                 detectedWeight = match[0].toLowerCase().replace(/\s/g, ''); // Normalizes '500 g' to '500g'
//                 break;
//             }
//         }

//         // 3. Extract Product Name
//         // Heuristic: Avoid common junk words like "MRP", "Mfg", "Net Weight"
//         const junkWords = ['mrp', 'rs', 'net', 'weight', 'mfg', 'exp', 'date', 'batch', 'inclusive', 'taxes', '100%'];
//         let parsedProductName = '';

//         for (const line of lines) {
//             const isJunk = junkWords.some(junk => line.toLowerCase().includes(junk));
//             // If it's not junk and it's not just the weight we just found, use it as the name
//             if (!isJunk && !line.match(weightRegex)) {
//                 parsedProductName = line;
//                 break;
//             }
//         }

//         // Fallback if the heuristic fails
//         if (!parsedProductName) {
//             parsedProductName = lines[0];
//         }

//         // 4. Combine Name + Weight for highly specific comparison
//         const exactSearchQuery = detectedWeight ? `${parsedProductName} ${detectedWeight}` : parsedProductName;

//         // Redirect to compare route with the highly specific query
//         const redirectUrl = `/api/compare?product=${encodeURIComponent(exactSearchQuery)}&city=${encodeURIComponent(city || 'Delhi')}`;
        
//         res.redirect(redirectUrl);

//     } catch (err) {
//         console.error('Error processing OCR:', err.message);
//         res.status(500).json({ success: false, error: 'Failed to process OCR text' });
//     }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();

// // POST /api/ocr
// // Action: Receives raw OCR text, intelligently parses product keywords & weight, and redirects to /api/compare
// router.post('/', async (req, res) => {
//     const { ocrText, lat = 28.6139, lon = 77.2090 } = req.body;

//     if (!ocrText) {
//         return res.status(400).json({ success: false, error: 'OCR text is required' });
//     }

//     try {
//         // 1. Clean the incoming ML Kit text
//         const rawLines = ocrText.split('\n')
//             .map(line => line.trim())
//             .filter(line => line.length > 2); // Ignore random tiny symbols

//         if (rawLines.length === 0) {
//             return res.status(400).json({ success: false, error: 'No valid text detected' });
//         }

//         // 2. Intelligent Weight Extractor Regex
//         // Looks for things like "500g", "1 kg", "200 ml", "1 Ltr"
//         let detectedWeight = '';
//         const weightRegex = /(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|pcs|pack|gm)\b/i;
        
//         for (const line of rawLines) {
//             const match = line.match(weightRegex);
//             if (match) {
//                 // Normalizes output, e.g., "500 gm" -> "500g"
//                 let unit = match[2].toLowerCase();
//                 if (unit === 'gm') unit = 'g';
//                 if (unit === 'ltr') unit = 'l';
//                 detectedWeight = `${match[1]}${unit}`;
//                 break;
//             }
//         }

//         // 3. Junk Word Filter (Remove things ML Kit sees that aren't product names)
//         const junkKeywords = [
//             'mrp', 'rs', 'net', 'weight', 'mfg', 'exp', 'date', 'batch', 'inclusive',
//             'taxes', '100%', 'new', 'pack', 'free', 'rupees', '₹', 'fssai', 'store',
//             'ingredients', 'calories', 'sugar', 'best before', 'manufactured'
//         ];

//         let bestProductName = '';
        
//         // Find the first line that is NOT junk and is NOT just the weight
//         for (const line of rawLines) {
//             const lineLower = line.toLowerCase();
            
//             // Check if line contains any junk words
//             const isJunk = junkKeywords.some(junk => lineLower.includes(junk));
            
//             // Check if line is purely the weight (e.g. just "500g")
//             const isJustWeight = lineLower.replace(/\s/g, '') === detectedWeight;

//             // If it's a clean line, we assume it's the Brand / Product Name!
//             if (!isJunk && !isJustWeight && line.length > 3) {
//                 bestProductName = line;
//                 break;
//             }
//         }

//         // Fallback: if everything was flagged as junk, just use the first line
//         if (!bestProductName) {
//             bestProductName = rawLines[0];
//         }

//         // 4. Construct the Final Super-Query
//         // We append the exact weight to the name so the Compare API forces exact matches!
//         const finalQuery = detectedWeight ? `${bestProductName} ${detectedWeight}` : bestProductName;
        
//         console.log(`[OCR Engine] Parsed: "${bestProductName}", Weight: "${detectedWeight}"`);
//         console.log(`[OCR Engine] Redirecting to QuickCommerce with query: "${finalQuery}"`);

//         // 5. Redirect internally to the compare route
//         const redirectUrl = `/api/compare?product=${encodeURIComponent(finalQuery)}&lat=${lat}&lon=${lon}`;
//         res.redirect(redirectUrl);

//     } catch (err) {
//         console.error('Error processing OCR:', err.message);
//         res.status(500).json({ success: false, error: 'Failed to process OCR text' });
//     }
// });

// module.exports = router;

// ocrRoutes.js
// const express = require('express');
// const router = express.Router();

// router.post('/', async (req, res) => {
//     const { ocrText, lat = 28.6139, lon = 77.2090 } = req.body;

//     if (!ocrText) {
//         return res.status(400).json({ success: false, error: 'OCR text is required' });
//     }

//     try {
//         const rawLines = ocrText.split('\n')
//             .map(line => line.trim())
//             .filter(line => line.length > 2); 

//         if (rawLines.length === 0) {
//             return res.status(400).json({ success: false, error: 'No valid text detected' });
//         }

//         let detectedWeight = '';
//         const weightRegex = /(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|pcs|pack|gm)\b/i;
        
//         for (const line of rawLines) {
//             const match = line.match(weightRegex);
//             if (match) {
//                 let unit = match[2].toLowerCase();
//                 if (unit === 'gm') unit = 'g';
//                 if (unit === 'ltr') unit = 'l';
//                 detectedWeight = `${match[1]}${unit}`;
//                 break;
//             }
//         }

//         const junkKeywords = [
//             'mrp', 'rs', 'net', 'weight', 'mfg', 'exp', 'date', 'batch', 'inclusive',
//             'taxes', '100%', 'new', 'pack', 'free', 'rupees', '₹', 'fssai', 'store',
//             'ingredients', 'calories', 'sugar', 'best before', 'manufactured'
//         ];

//         let bestProductName = '';
        
//         for (const line of rawLines) {
//             const lineLower = line.toLowerCase();
//             const isJunk = junkKeywords.some(junk => lineLower.includes(junk));
//             const isJustWeight = lineLower.replace(/\s/g, '') === detectedWeight;

//             if (!isJunk && !isJustWeight && line.length > 3) {
//                 bestProductName = line;
//                 break;
//             }
//         }

//         if (!bestProductName) {
//             bestProductName = rawLines[0];
//         }

//         const finalQuery = detectedWeight ? `${bestProductName} ${detectedWeight}` : bestProductName;
        
//         console.log(`[OCR Engine] Parsed: "${bestProductName}", Weight: "${detectedWeight}"`);

//         // INSTEAD OF REDIRECTING, WE RETURN THE CLEAN DATA TO THE APP
//         res.json({ 
//             success: true, 
//             parsedQuery: finalQuery,
//             displayName: bestProductName // We send this so the App UI looks clean!
//         });

//     } catch (err) {
//         console.error('Error processing OCR:', err.message);
//         res.status(500).json({ success: false, error: 'Failed to process OCR text' });
//     }
// });

// module.exports = router;

// ocrRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/ocr
// Action: Receives raw OCR text, parses product name/weight, and fetches comparison internally!
router.post('/', async (req, res) => {
    const { ocrText, lat = 28.6139, lon = 77.2090 } = req.body;

    if (!ocrText) {
        return res.status(400).json({ success: false, error: 'OCR text is required' });
    }

    try {
        // 1. Clean the incoming ML Kit text
        const rawLines = ocrText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 2);

        if (rawLines.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid text detected' });
        }

        // 2. Intelligent Weight Extractor Regex
        let detectedWeight = '';
        const weightRegex = /(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|pcs|pack|gm)\b/i;
        
        for (const line of rawLines) {
            const match = line.match(weightRegex);
            if (match) {
                let unit = match[2].toLowerCase();
                if (unit === 'gm') unit = 'g';
                if (unit === 'ltr') unit = 'l';
                detectedWeight = `${match[1]}${unit}`;
                break;
            }
        }

        // 3. Junk Word Filter
        const junkKeywords = [
            'mrp', 'rs', 'net', 'weight', 'mfg', 'exp', 'date', 'batch', 'inclusive',
            'taxes', '100%', 'new', 'pack', 'free', 'rupees', '₹', 'fssai', 'store',
            'ingredients', 'calories', 'sugar', 'best before', 'manufactured'
        ];

        let bestProductName = '';
        
        for (const line of rawLines) {
            const lineLower = line.toLowerCase();
            const isJunk = junkKeywords.some(junk => lineLower.includes(junk));
            const isJustWeight = lineLower.replace(/\s/g, '') === detectedWeight;

            if (!isJunk && !isJustWeight && line.length > 3) {
                bestProductName = line;
                break;
            }
        }

        if (!bestProductName) {
            bestProductName = rawLines[0];
        }

        // 4. Construct the Final Super-Query
        const finalQuery = detectedWeight ? `${bestProductName} ${detectedWeight}` : bestProductName;
        
        console.log(`[OCR Engine] Parsed: "${bestProductName}", Weight: "${detectedWeight}"`);
        console.log(`[OCR Engine] Fetching QuickCommerce internally for: "${finalQuery}"`);

        // =================================================================================
        // 5. INTERNAL FETCH (NO REDIRECT!)
        // We fetch the data right here and mimic compareRoutes.js so the app never knows!
        // =================================================================================
        const apiKey = process.env.QUICKCOMMERCEAPIKEY || process.env.QUICKCOMMERCE_API_KEY || process.env.QUICK_COMMERCE_API_KEY;
        const config = { headers: { 'X-API-Key': apiKey }, timeout: 10000 };

        const [blinkitRes, zeptoRes, swiggyRes] = await Promise.allSettled([
            axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: finalQuery, lat, lon, platform: 'BlinkIt' }, ...config }),
            axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: finalQuery, lat, lon, platform: 'Zepto' }, ...config }),
            axios.get('https://api.quickcommerceapi.com/v1/search', { params: { q: finalQuery, lat, lon, platform: 'Swiggy' }, ...config })
        ]);

        const blinkitResults = blinkitRes.status === 'fulfilled' && blinkitRes.value.data?.status === 'success' ? blinkitRes.value.data.data.products : [];
        const zeptoResults = zeptoRes.status === 'fulfilled' && zeptoRes.value.data?.status === 'success' ? zeptoRes.value.data.data.products : [];
        const swiggyResults = swiggyRes.status === 'fulfilled' && swiggyRes.value.data?.status === 'success' ? swiggyRes.value.data.data.products : [];

        let targetWeightToMatch = null;
        let baselinePrice = null;
        let baselineItem = blinkitResults[0] || zeptoResults[0] || swiggyResults[0];

        if (baselineItem) {
            targetWeightToMatch = baselineItem.quantity || baselineItem.weight || baselineItem.packsize; 
            baselinePrice = parseFloat(baselineItem.offer_price || baselineItem.mrp || baselineItem.price || 0);
        }

        const filterSmart = (results) => {
            if (!results || results.length === 0) return [];
            if (!targetWeightToMatch || !baselinePrice) return [results[0]]; 
            
            const targetNormal = String(targetWeightToMatch).toLowerCase().replace(/\s/g, '');
            const targetNum = parseFloat(targetNormal); 

            let bestSingleMatch = null;
            let bestComboMatch = null;

            for (let item of results) {
                const itemWeight = String(item.quantity || item.weight || item.packsize || '').toLowerCase().replace(/\s/g, '');
                const itemNum = parseFloat(itemWeight);
                const itemPrice = parseFloat(item.offer_price || item.mrp || item.price || 0);

                let isWeightMatch = (itemWeight === targetNormal);
                if (!isWeightMatch && !isNaN(targetNum) && !isNaN(itemNum)) {
                    const diff = Math.abs(targetNum - itemNum);
                    isWeightMatch = diff <= (targetNum * 0.15);
                }

                if (isWeightMatch && itemPrice > 0) {
                    const nameLower = String(item.name).toLowerCase();
                    const hasComboKeyword = nameLower.includes('pack of') || nameLower.includes('multipack') || nameLower.includes('combo');

                    if (itemPrice > (baselinePrice * 2.5) || hasComboKeyword) {
                        if (!bestComboMatch) {
                            item.is_combo = true;
                            const estimatedPacks = Math.round(itemPrice / baselinePrice);
                            item.combo_estimate = estimatedPacks > 1 ? estimatedPacks : null;
                            bestComboMatch = item;
                        }
                    } else if (itemPrice >= (baselinePrice * 0.3)) {
                        if (!bestSingleMatch) bestSingleMatch = item;
                    }
                }
                if (bestSingleMatch) break; 
            }

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
            item: bestProductName, // Returns the clean name for the UI!
            targetWeight: targetWeightToMatch ? String(targetWeightToMatch) : 'Unknown',
            platforms: platformsData,
            creditsRemaining: blinkitRes.value?.data?.credits_remaining || 'Unknown' 
        };

        // Send the exact data structure the ProductResultsScreen expects!
        res.json({ success: true, data: comparisonData });

    } catch (err) {
        console.error('Error processing OCR & Compare:', err.message);
        res.status(500).json({ success: false, error: 'Failed to process scanned text' });
    }
});

module.exports = router;