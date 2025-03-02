const mongoose = require('../db');

const paymentSchema = new mongoose.Schema({
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPackage', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now }, 
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    transactionId: { type: String, required: false },
    photo: { type: String, required: false },

}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
