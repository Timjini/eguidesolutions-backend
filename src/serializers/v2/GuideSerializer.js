const Agency = require("../../models/Agency");
const Guide = require("../../models/Guide");
const UserProfile = require("../../models/UserProfile");
const User = require("../../models/Users");
const Rating = require("../../models/Rating");

class GuideSerializer {
  static async serialize(guide) {
    if (!guide) {
      return null;
    }

    const user = await User.findOne({ _id: guide?.user });
    console.log("user id ", user._id);
    const userProfile = await UserProfile.findOne({ user: user._id });
    console.log("user", userProfile);

    const agency = await Agency.findOne({ _id: guide?.agency });
    console.log("agency," , agency);

    const ratings = await Rating.find({ refId: guide._id, refType: "Guide" });

    let averageRating = 0;
    if (ratings.length > 0) {
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      averageRating = totalRating / ratings.length;
    }

    return {
      _id: guide?._id,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      avatar: user?.avatar,
      rating: averageRating.toFixed(1),
      comments: ratings.map(rating => rating.comment || "No comment"),
      agency_name: agency?.name,
      agency_image: agency?.image,
    };
  }
}

module.exports = GuideSerializer;
