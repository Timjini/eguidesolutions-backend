const mongoose = require('../db');

const addressSchema = new mongoose.Schema({
    // id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     auto: true
    // },
    street_1: {
        type: String,
        required: false
    },
    street_2: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    state: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    postal_code: {
        type: String
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
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

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
