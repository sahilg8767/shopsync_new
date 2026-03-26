const mongoose = require('mongoose');
const dotenv = require('dotenv');
const syncProducts = require('./src/utils/syncProducts');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

dotenv.config();

const testSync = async () => {
    try {
        console.log('Connecting to DB...');
        await connectDB();

        console.log('\n--- Running syncProducts() ---');
        await syncProducts();

        console.log('\n--- Fetching all products from DB ---');
        const count = await Product.countDocuments();
        console.log(`Total products in DB: ${count}`);
        
        const sample = await Product.find().limit(3);
        if (sample.length > 0) {
            console.log(`Sample Products (${sample.length}):`, JSON.stringify(sample, null, 2));
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('DB Disconnected. Test finished.');
    }
};

testSync();
