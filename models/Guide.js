const mongoose = require('../db');


const guideSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
});

const Guide = mongoose.model('Guide', guideSchema);
module.exports = Guide;