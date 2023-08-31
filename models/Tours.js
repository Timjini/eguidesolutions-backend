const mongoose = require('../db');

const tourSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    date: { type: Date, required: true },
    startLocation: {
        type: {
            type: String,
            enum: ['Point'], // Only "Point" type allowed for GeoJSON
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers [longitude, latitude]
            required: true
        }
    },
    endLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});


tourSchema.pre('save', async function (next) {
    // Check if the startLocation field is provided
    if (!this.startLocation.address) {
        return next();
    }

    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

    try {
        const response = await axios.get(baseUrl, {
            params: {
                address: this.startLocation.address,
                key: apiKey,
            },
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            this.startLocation.coordinates = [location.lng, location.lat];
        }
    } catch (error) {
        console.error('Geocoding error:', error.message);
    }

    next();
});

// Create an index for the startLocation and endLocation fields
// tourSchema.index({ startLocation: '2dsphere', endLocation: '2dsphere' });

// Create and export the Tour model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
