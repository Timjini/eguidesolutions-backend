const mongoose = require('../db');

const tourSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: false }, // You can store the photo URL here
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
});


// Create an index for the startLocation and endLocation fields
// tourSchema.index({ startLocation: '2dsphere', endLocation: '2dsphere' });

// Create and export the Tour model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
