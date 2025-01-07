const mongoose = require("../db");


const guideReviewsSchema = new mongoose.Schema({
  guide: { type: mongoose.Schema.Types.ObjectId, ref: "Guide", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const GuideReviews = mongoose.model("GuideReviews", guideReviewsSchema);

module.exports = GuideReviews;
