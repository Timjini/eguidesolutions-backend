const mongoose = require('../db');
const addressSchema = require('./Address').schema;

const tourSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: false },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    stops: { type: [addressSchema], required: false },
    price: { type: Number, required: false },
    // address:{type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true},
}, { timestamps: true });

// Create and export the Tour model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
