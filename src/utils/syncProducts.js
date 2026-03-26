const axios = require('axios');
const Product = require('../models/Product');

const syncProducts = async () => {
    try {
        console.log('Starting product sync job...');
        const categories = ['snacks', 'milk', 'dal', 'cold drink'];
        let allNormalizedProducts = [];

        for (const category of categories) {
            console.log(`Fetching data for category: ${category}`);
            const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
                headers: {
                    'X-API-Key': process.env.QUICK_COMMERCE_API_KEY
                },
                params: {
                    q: category,
                    platform: 'Zepto',
                    lat: '28.6139',
                    lon: '77.2090'
                }
            });

            // Data Transformation step:
            // Extract the nested products list, as the API wraps it in data.products
            let items = [];
            if (Array.isArray(response.data)) {
                items = response.data;
            } else if (response.data.data && Array.isArray(response.data.data.products)) {
                items = response.data.data.products;
            } else if (Array.isArray(response.data.data)) {
                items = response.data.data;
            } else if (Array.isArray(response.data.results)) {
                items = response.data.results;
            }
            
            // Data Transformation step:
            // Normalize the returned items to match our Mongoose Product schema.
            // We use fallbacks (||) for common field names in external APIs.
            const normalized = items.map(item => ({
                name: item.name || item.title || 'Unknown Product',
                brand: item.brand || '',
                category: category,
                weight: item.weight || item.quantity || item.pack_size || '',
                mrp: Number(item.mrp || item.price || 0),
                imageUrl: item.imageUrl || item.image || item.image_url || '',
                tags: Array.isArray(item.tags) ? item.tags : [],
                inStock: item.inStock !== false, // Defaults to true if undefined
                lastUpdated: new Date()
            }));

            allNormalizedProducts = allNormalizedProducts.concat(normalized);
        }

        if (allNormalizedProducts.length > 0) {
            // Clear the existing Product collection
            await Product.deleteMany({});
            console.log('Cleared existing products.');

            // Insert the new normalized data
            await Product.insertMany(allNormalizedProducts);
            console.log(`Successfully inserted ${allNormalizedProducts.length} normalized products.`);
        } else {
            console.log('No products found to sync across evaluated categories.');
        }

    } catch (error) {
        console.error('Error during product sync:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

module.exports = syncProducts;
