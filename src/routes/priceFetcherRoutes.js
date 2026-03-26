const express = require('express');
const router = express.Router();
const { fetchPrices } = require('../controllers/priceFetcherController');

// POST /api/price-fetcher - Fetch prices
router.post('/', fetchPrices);

module.exports = router;
