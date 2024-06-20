const mongoose = require('../db');

const addressSchema = mongoose.Schema({
    street_1: {
        type: String,
        required: true
    },
    street_2: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    postal_code: {
        type: String,
        required: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        lang: {
            type: Number,
            required: true
        }
    },
    address_type: {
        type: Number,
        enum: [0, 1, 2], // 0: start, 1: end, 2: stop
        required: true
    }
});

const Adress = mongoose.model('Address', addressSchema);
module.exports = Adress;
