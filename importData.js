require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Product = require('./src/models/Product');

const URI = process.env.MONGO_URI;
const DATA_PATH = "c:\\Users\\Lenovo\\AppData\\Local\\Packages\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\\LocalState\\sessions\\A6136B50D5327C9772A148F93CD9BAFF0216EBDE\\transfers\\2026-13\\indian_grocery_dataset.json";

async function importData() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(URI);
        console.log("Connected successfully.");

        console.log("Reading Indian Grocery JSON dataset from WhatsApp folder...");
        const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
        const items = JSON.parse(rawData);
        console.log(`Found ${items.length} items to import.`);

        console.log("Formatting data for the Product schema...");
        const formattedItems = items.map(item => {
            const { _id, ...rest } = item; 
            return {
                ...rest,
                price: item.mrp || Math.floor(Math.random() * 500) + 10, // mapping mrp to price
                id: _id ? _id.$oid : undefined, // map original oid to string id field
            };
        });

        console.log("Clearing existing products in database before import...");
        await Product.deleteMany({});
        
        console.log("Importing new items (this will take a few seconds)...");
        await Product.insertMany(formattedItems);
        console.log("✅ Import SUCCESS! All thousands of grocery items are now live.");

        process.exit();
    } catch (e) {
        console.error("❌ Error importing data:\n", e);
        process.exit(1);
    }
}
importData();
