const mongoose = require('../db');


const guideSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Add other guide-specific fields here
});

const Guide = mongoose.model('Guide', guideSchema);
module.exports = Guide;