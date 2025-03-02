const mongoose = require('../db');
const addressSchema = require('../models/Address').schema;

const itinerarySchema = mongoose.Schema({
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    start_point: { type: addressSchema, required: true },
    end_point: { type: addressSchema, required: true },
    stops: { type: [addressSchema] },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
