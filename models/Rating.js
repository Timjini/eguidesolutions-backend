const mongoose = require('../db');

const ratingSchema = new mongoose.Schema({
  refId: { type: mongoose.Schema.Types.ObjectId, required: true },
  refType: { type: String, required: true, enum: ["Guide", "Tour"] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
  comment: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

reviewSchema.index({ refId: 1, refType: 1 });

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;