// const express = require('express');
// const router = express.Router();
// const { receiveOCRData } = require('../controllers/ocrController');

// // POST /api/ocr - Receive OCR data
// router.post('/', receiveOCRData);

// module.exports = router;


const express = require('express');
const router = express.Router();

// POST /api/ocr
// Action: Receives OCR text, parses product name, and redirects to /api/compare
router.post('/', async (req, res) => {
  const { ocrText, city } = req.body;
  
  if (!ocrText) {
    return res.status(400).json({ success: false, error: 'OCR text is required' });
  }

  try {
    // Basic heuristic: Assume the first line of the OCR string is the product name
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const parsedProductName = lines[0];
    
    if (!parsedProductName) {
      return res.status(400).json({ success: false, error: 'Could not parse a valid product name from OCR' });
    }

    // Redirect to the compare route
    const redirectUrl = `/api/compare?product=${encodeURIComponent(parsedProductName)}&city=${encodeURIComponent(city || 'Delhi')}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Error processing OCR:', err.message);
    res.status(500).json({ success: false, error: 'Failed to process OCR text' });
  }
});

module.exports = router;
