const mongoose = require('../db');

const itinerarySchema = mongoose.Schema({
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
    start_point: { type: Object, required: true },
    end_point: { type: Object, required: true },
    stops: { type: Array }
});

const Itinerary = mongoose.Model('Itinerary', itinerarySchema);

module.exports = Itinerary;