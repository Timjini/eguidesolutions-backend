const mongoose = require('../db');

// TODO add address to agency
const agencySchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: false, default:''},
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tour' }], 
    image: { type: String, required: false },
    address:{type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: false},
    status: { type: String, enum: ['inactive', 'active'], default: 'inactive' },
});

const Agency = mongoose.model('Agency', agencySchema);
module.exports = Agency;

