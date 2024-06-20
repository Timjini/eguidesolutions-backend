const mongoose = require('../db');

const stopSchema = mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
});

const itinerarySchema = mongoose.Schema({
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    start_point: { type: Object, required: true },
    end_point: { type: Object, required: true },
    stops: { type: [Object] },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

const Itinerary = mongoose.Model('Itinerary', itinerarySchema);

module.exports = Itinerary;