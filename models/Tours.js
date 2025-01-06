const mongoose = require('../db');
const addressSchema = require('./Address').schema;

const tourSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: false }, // You can store the photo URL here
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    start_point: { type: addressSchema, required: true },
    end_point: { type: addressSchema, required: true },
    stops: { type: [addressSchema], required: false },
    // address:{type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true},
});

// Create and export the Tour model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
