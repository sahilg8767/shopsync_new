// const express = require('express');
// const router = express.Router();
// const { receiveOCRData } = require('../controllers/ocrController');

// // POST /api/ocr - Receive OCR data
// router.post('/', receiveOCRData);

// module.exports = router;

// =========================================================================================================================

// const express = require('express');
// const router = express.Router();

// // POST /api/ocr
// // Action: Receives OCR text, parses product name, and redirects to /api/compare
// router.post('/', async (req, res) => {
//   const { ocrText, city } = req.body;
  
//   if (!ocrText) {
//     return res.status(400).json({ success: false, error: 'OCR text is required' });
//   }

//   try {
//     // Basic heuristic: Assume the first line of the OCR string is the product name
//     const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
//     const parsedProductName = lines[0];
    
//     if (!parsedProductName) {
//       return res.status(400).json({ success: false, error: 'Could not parse a valid product name from OCR' });
//     }

//     // Redirect to the compare route
//     const redirectUrl = `/api/compare?product=${encodeURIComponent(parsedProductName)}&city=${encodeURIComponent(city || 'Delhi')}`;
//     res.redirect(redirectUrl);
//   } catch (err) {
//     console.error('Error processing OCR:', err.message);
//     res.status(500).json({ success: false, error: 'Failed to process OCR text' });
//   }
// });

// module.exports = router;

// =========================================================================================================================

// ocrRoutes.js
const express = require('express');
const router = express.Router();

// POST /api/ocr -> Receives OCR text, parses product name/weight, and redirects to /api/compare
router.post('/', async (req, res) => {
    const { ocrText, city } = req.body;

    if (!ocrText) {
        return res.status(400).json({ success: false, error: 'OCR text is required' });
    }

    try {
        // 1. Clean up OCR Text
        const lines = ocrText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 2); // Ignore single characters/noise

        if (lines.length === 0) {
            return res.status(400).json({ success: false, error: 'Could not parse a valid product name from OCR' });
        }

        // 2. Extract Weight (e.g., 500g, 1kg, 200ml) using Regex
        let detectedWeight = '';
        const weightRegex = /(\d+)\s*(g|kg|ml|l|ltr|pcs|pack)/i;
        
        for (const line of lines) {
            const match = line.match(weightRegex);
            if (match) {
                detectedWeight = match[0].toLowerCase().replace(/\s/g, ''); // Normalizes '500 g' to '500g'
                break;
            }
        }

        // 3. Extract Product Name
        // Heuristic: Avoid common junk words like "MRP", "Mfg", "Net Weight"
        const junkWords = ['mrp', 'rs', 'net', 'weight', 'mfg', 'exp', 'date', 'batch', 'inclusive', 'taxes', '100%'];
        let parsedProductName = '';

        for (const line of lines) {
            const isJunk = junkWords.some(junk => line.toLowerCase().includes(junk));
            // If it's not junk and it's not just the weight we just found, use it as the name
            if (!isJunk && !line.match(weightRegex)) {
                parsedProductName = line;
                break;
            }
        }

        // Fallback if the heuristic fails
        if (!parsedProductName) {
            parsedProductName = lines[0];
        }

        // 4. Combine Name + Weight for highly specific comparison
        const exactSearchQuery = detectedWeight ? `${parsedProductName} ${detectedWeight}` : parsedProductName;

        // Redirect to compare route with the highly specific query
        const redirectUrl = `/api/compare?product=${encodeURIComponent(exactSearchQuery)}&city=${encodeURIComponent(city || 'Delhi')}`;
        
        res.redirect(redirectUrl);

    } catch (err) {
        console.error('Error processing OCR:', err.message);
        res.status(500).json({ success: false, error: 'Failed to process OCR text' });
    }
});

module.exports = router;