const mongoose = require('../db');
const addressSchema = require('./Address').schema;

const tourSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: false },
    gallery: { type: [String], required: false },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    stops: { type: [addressSchema], required: false },
    price: { type: Number, required: false },
    start_point: { type: addressSchema, required: true },
    end_point: { type: addressSchema, required: true },
    promoted: { type: Boolean, default: false }, // this should be replaced by a table of promotions
    tags: { type: [String], required: false }, // this should be replaced by a table of tags example: ['hiking', 'nature', 'adventure', 'history', 'culture']
    // address:{type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true},
}, { timestamps: true });

// Create and export the Tour model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
