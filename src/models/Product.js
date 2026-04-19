// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     brand: { type: String },
//     category: { type: String, required: true },
//     weight: { type: String },
//     mrp: { type: Number, required: true },
//     imageUrl: { type: String },
//     tags: [{ type: String }],
//     inStock: { type: Boolean, default: true },
//     lastUpdated: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Product', productSchema);


// =========================================================================================================================

// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   brand: { type: String },
//   category: { type: String, required: true },
//   weight: { type: String },
//   mrp: { type: Number, required: true },
//   imageUrl: { type: String },
//   tags: [{ type: String }],
//   inStock: { type: Boolean, default: true },
//   lastUpdated: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Product', productSchema);

// =========================================================================================================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    brand: String,
    category: String,
    weight: String,
    mrp: Number,
    imageUrl: String,
    region: String, // e.g., 'Delhi', 'Mumbai'
    lastUpdated: Date
});

module.exports = mongoose.model('Product', productSchema);