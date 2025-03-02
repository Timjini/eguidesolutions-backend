const mongoose = require('../db');

const subscriptionPackageSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    description: { type: String, default: '' },
    durationInMonths: { type: Number, required: true }, 
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const SubscriptionPackage = mongoose.model('SubscriptionPackage', subscriptionPackageSchema);
module.exports = SubscriptionPackage;
