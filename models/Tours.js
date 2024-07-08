const mongoose = require('../db');

const tourSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: false }, // You can store the photo URL here
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    starting_date: { type: Date, ref: 'Starting Date', required: false },
    ending_date: { type: Date, ref: 'Ending Date', required: false },
    start_point: { type: String, ref: 'Start Point', required: true},
    end_point: { type: String, ref: 'End Point', required: true},
    stops: { type: Array, required: false}
});


// Create an index for the startLocation and endLocation fields
// tourSchema.index({ startLocation: '2dsphere', endLocation: '2dsphere' });

// Create and export the Tour model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
