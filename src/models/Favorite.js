const mongoose = require("../db");

const favoriteSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  isFavorite: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
};

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;
