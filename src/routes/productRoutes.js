const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        // Case-insensitive matching
        const products = await Product.find({ category: new RegExp('^' + category + '$', 'i') });

        if (products.length === 0) {
            return res.status(404).json({ message: `No products found in category: ${category}` });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

module.exports = router;
