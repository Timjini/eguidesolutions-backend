const mongoose = require("../db");
const User = require("./Users");

const guideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: true,
  },
  name: { type: String, required: false },
  avatar: { type: String },
  tags: [{ type: String }],
  ratings : { type: Number, enum: [1, 2, 3, 4, 5], default: 1},
});

const Guide = mongoose.model("Guide", guideSchema);

// Create a static method to create a new Guide with user's name and avatar
Guide.createGuideWithUserData = async function (userId, agencyId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newGuide = new Guide({
      user: userId,
      agency: agencyId,
      name: user.name,
      avatar: user.avatar,
    });

    await newGuide.save();

    return newGuide;
  } catch (error) {
    throw error;
  }
};

module.exports = Guide;
