const mongoose = require('../db');

const subscriptionSchema = new mongoose.Schema({
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPackage', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['active', 'expired', 'pending'], 
        default: 'pending' 
    },
    payment_status: {
        type: String,
        enum: ['paid', 'pending', 'paid_partially', 'cancelled'],
        default: 'pending'
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
