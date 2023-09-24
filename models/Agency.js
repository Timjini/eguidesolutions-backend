const mongoose = require('../db');


const agencySchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the owner (user)
    description: { type: String, required: false, default:''},
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    image: { type: String, required: false }
    // ... other agency-specific fields ...
});

const Agency = mongoose.model('Agency', agencySchema);
module.exports = Agency;

