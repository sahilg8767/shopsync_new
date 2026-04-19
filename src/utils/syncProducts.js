// const axios = require('axios');
// const Product = require('../models/Product');

// const syncProducts = async () => {
//     try {
//         console.log('Starting product sync job...');
//         const categories = ['snacks', 'milk', 'dal', 'cold drink'];
//         let allNormalizedProducts = [];

//         for (const category of categories) {
//             console.log(`Fetching data for category: ${category}`);
//             const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
//                 headers: {
//                     'X-API-Key': process.env.QUICK_COMMERCE_API_KEY
//                 },
//                 params: {
//                     q: category,
//                     platform: 'Zepto',
//                     lat: '28.6139',
//                     lon: '77.2090'
//                 }
//             });

//             // Data Transformation step:
//             // Extract the nested products list, as the API wraps it in data.products
//             let items = [];
//             if (Array.isArray(response.data)) {
//                 items = response.data;
//             } else if (response.data.data && Array.isArray(response.data.data.products)) {
//                 items = response.data.data.products;
//             } else if (Array.isArray(response.data.data)) {
//                 items = response.data.data;
//             } else if (Array.isArray(response.data.results)) {
//                 items = response.data.results;
//             }
            
//             // Data Transformation step:
//             // Normalize the returned items to match our Mongoose Product schema.
//             // We use fallbacks (||) for common field names in external APIs.
//             const normalized = items.map(item => ({
//                 name: item.name || item.title || 'Unknown Product',
//                 brand: item.brand || '',
//                 category: category,
//                 weight: item.weight || item.quantity || item.pack_size || '',
//                 mrp: Number(item.mrp || item.price || 0),
//                 imageUrl: item.imageUrl || item.image || item.image_url || '',
//                 tags: Array.isArray(item.tags) ? item.tags : [],
//                 inStock: item.inStock !== false, // Defaults to true if undefined
//                 lastUpdated: new Date()
//             }));

//             allNormalizedProducts = allNormalizedProducts.concat(normalized);
//         }

//         if (allNormalizedProducts.length > 0) {
//             // Clear the existing Product collection
//             await Product.deleteMany({});
//             console.log('Cleared existing products.');

//             // Insert the new normalized data
//             await Product.insertMany(allNormalizedProducts);
//             console.log(`Successfully inserted ${allNormalizedProducts.length} normalized products.`);
//         } else {
//             console.log('No products found to sync across evaluated categories.');
//         }

//     } catch (error) {
//         console.error('Error during product sync:', error.message);
//         if (error.response) {
//             console.error('Response data:', error.response.data);
//         }
//     }
// };

// module.exports = syncProducts;


// const axios = require('axios');
// const Product = require('../models/Product');

// const syncProducts = async () => {
//   console.log('Starting daily QuickCommerce catalog sync...');
  
//   // Baseline search terms to populate the home screen
//   const categories = ['snacks', 'dairy', 'beverages'];
//   const lat = 28.6139; // Delhi center
//   const lon = 77.2090;

//   try {
//     let freshCatalog = [];

//     // Loop through each category and fetch from BlinkIt as our baseline catalog truth
//     for (const category of categories) {
//       console.log(`Fetching baseline data for: ${category}`);
      
//       const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
//         params: { q: category, lat, lon, platform: 'BlinkIt' },
//         headers: { 'X-API-Key': process.env.QUICK_COMMERCE_API_KEY }
//       });

//       if (response.data.status === 'success' && response.data.data.products) {
//         // Map the real API payload to our Mongoose Schema
//         const mappedProducts = response.data.data.products.map(item => ({
//           name: item.name,
//           brand: item.brand || 'Generic',
//           category: category,
//           weight: item.quantity,
//           mrp: item.mrp || item.offer_price,
//           imageUrl: item.images && item.images.length > 0 ? item.images[0] : '',
//           tags: [category],
//           inStock: item.available,
//           lastUpdated: new Date()
//         }));

//         freshCatalog.push(...mappedProducts);
//       }
//     }

//     if (freshCatalog.length > 0) {
//       // Wipe old collection and insert fresh catalog
//       await Product.deleteMany({});
//       await Product.insertMany(freshCatalog);
//       console.log(`Successfully synced ${freshCatalog.length} products to the database.`);
//     } else {
//       console.log('No products fetched. Aborting database wipe.');
//     }

//   } catch (error) {
//     console.error('Failed to sync catalog:', error?.response?.data || error.message);
//   }
// };

// module.exports = syncProducts;

// =========================================================================================================================

// const axios = require('axios');
// const Product = require('../models/Product'); // Adjust path if needed

// const syncProducts = async () => {
//   console.log('Starting massive daily QuickCommerce catalog sync...');
  
//   // Create an expanded map of search queries to get HUNDREDS of items
//   const categoryKeywords = {
//     snacks: ['chips', 'namkeen', 'biscuits', 'popcorn', 'chocolates', 'cookies'],
//     dairy: ['milk', 'paneer', 'curd', 'butter', 'cheese', 'yogurt'],
//     beverages: ['cold drink', 'juice', 'water', 'energy drink', 'soda'],
//     fruits: ['apple', 'banana', 'mango', 'grapes', 'orange', 'watermelon'],
//     vegetables: ['onion', 'potato', 'tomato', 'coriander', 'spinach', 'chilli']
//   };

//   const lat = 28.6139; // Delhi
//   const lon = 77.2090;

//   try {
//     let freshCatalog = [];

//     // Loop through each category
//     for (const [category, keywords] of Object.entries(categoryKeywords)) {
//       console.log(`Fetching baseline data for category: ${category}...`);
      
//       // Loop through all keywords to get massive amounts of data
//       for (const keyword of keywords) {
//         try {
//           const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
//             params: { q: keyword, lat, lon, platform: 'BlinkIt' },
//             headers: { 'X-API-Key': process.env.QUICKCOMMERCE_API_KEY }
//           });

//           if (response.data?.status === 'success' && response.data.data?.products) {
//             const mappedProducts = response.data.data.products.map(item => ({
//               name: item.name,
//               brand: item.brand || 'Generic',
//               category: category, // Force it to map to the master category
//               weight: item.quantity || '1 unit',
//               mrp: item.mrp || item.offer_price || 0,
//               imageUrl: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
//               tags: [category, keyword],
//               inStock: item.available !== false,
//               lastUpdated: new Date()
//             }));

//             freshCatalog.push(...mappedProducts);
//           }
//         } catch (keywordErr) {
//           console.log(`Failed to fetch keyword ${keyword}, skipping...`);
//         }
//       }
//     }

//     if (freshCatalog.length > 0) {
//       // Remove duplicates by product name just in case searches overlap
//       const uniqueCatalog = Array.from(new Map(freshCatalog.map(item => [item.name, item])).values());

//       await Product.deleteMany({});
//       await Product.insertMany(uniqueCatalog);
//       console.log(`Successfully synced ${uniqueCatalog.length} products to the database.`);
//     } else {
//       console.log('No products fetched. Aborting database wipe.');
//     }

//   } catch (error) {
//     console.error('Failed to sync catalog:', error.message);
//   }
// };

// module.exports = syncProducts;


// =========================================================================================================================


// syncProducts.js
const axios = require('axios');
const Product = require('../models/Product');

// Focused regions: Delhi NCR
const regions = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Noida', lat: 28.5355, lon: 77.3910 },
    { name: 'Greater Noida', lat: 28.4744, lon: 77.5040 }
];

const categories = ['snacks', 'dairy', 'beverages', 'fruits', 'vegetables'];

const syncProducts = async () => {
    console.log('Starting daily catalog sync for Delhi NCR to save API tokens...');
    let freshCatalog = [];

    try {
        for (const region of regions) {
            console.log(`Fetching data for ${region.name}...`);
            
            for (const category of categories) {
                try {
                    // Fetch from API once per category/region
                    const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
                        params: { q: category, lat: region.lat, lon: region.lon, platform: 'BlinkIt' },
                        headers: { 'X-API-Key': process.env.QUICKCOMMERCE_API_KEY }
                    });

                    if (response.data?.status === 'success' && response.data.data?.products) {
                        const mappedProducts = response.data.data.products.map(item => ({
                            name: item.name,
                            brand: item.brand || 'Generic',
                            category: category,
                            weight: item.quantity,
                            mrp: item.mrp || item.offer_price,
                            imageUrl: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
                            region: region.name,
                            lastUpdated: new Date()
                        }));
                        freshCatalog.push(...mappedProducts);
                    }
                } catch (apiError) {
                    console.error(`Failed to fetch ${category} for ${region.name}:`, apiError.message);
                }
            }
        }

        if (freshCatalog.length > 0) {
            await Product.deleteMany({}); // Wipe old catalog
            await Product.insertMany(freshCatalog); // Save new localized catalog
            console.log(`Successfully cached ${freshCatalog.length} products for Delhi NCR.`);
        } else {
            console.log('No products fetched. Aborting database wipe.');
        }
    } catch (error) {
        console.error('Failed to sync catalog:', error.message);
    }
};

module.exports = syncProducts;