const Rating = require("../models/Rating");
const Guide = require("../models/Guide");
const Tour = require("../models/Tours");

class RatingService {
  static async calculateAverageRating(refId, refType) {
    try {
      const ratings = await Rating.find({ refId, refType });

      if (ratings.length === 0) {
        return 0;
      }

      const totalRating = ratings.reduce(
        (sum, rating) => sum + Math.round(rating.rating),
        0
      );

      const averageRating = Math.round(totalRating / ratings.length);

      return averageRating;
    } catch (error) {
      console.error("Error calculating average rating:", error);
      throw new Error("Could not calculate the average rating");
    }
  }

  static async addRating(refId, refType, userId, ratingValue, comment = "") {
    try {
      const newRating = new Rating({
        refId,
        refType,
        user: userId,
        rating: ratingValue,
        comment,
      });
      console.log("new rating----->", newRating);
      await newRating.save();

      return newRating;
    } catch (error) {
      console.error("Error adding rating:", error);
      throw new Error("Could not add the rating");
    }
  }
}

module.exports = RatingService;
