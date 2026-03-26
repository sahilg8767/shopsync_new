const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String },
    category: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    brand: { type: String },
    weight: { type: String },
    imageUrl: { type: String },
    tags: [{ type: String }],
    inStock: { type: Boolean, default: true },
    description: { type: String }
}, {
    timestamps: true,
    strict: false // Allows the DB to smoothly accept new properties if any
});

module.exports = mongoose.model('Product', productSchema);
