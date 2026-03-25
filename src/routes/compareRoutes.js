const express = require('express');
const router = express.Router();
const { getComparison } = require('../controllers/compareController');

// GET /api/compare - Compare prices across platforms
router.get('/', getComparison);

// Also adding a POST route since standard HTTP clients might have trouble sending request body with GET
router.post('/', getComparison);

module.exports = router;
