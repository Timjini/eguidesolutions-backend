const Guide = require("../../models/Guide");
const GuideSerializer = require("../../serializers/v2/GuideSerializer");
const RatingService = require('../../services/RatingService');


async function getGuide(req, res) {
  try {
    console.log("data", req.body)
    const guideId = req.body.guideId._id;
    const guide = await Guide.findOne({ _id: guideId });
    // Serialize each agency using the updated serializer
    //   const serializedAgencies = await Promise.all(
    //     agencies.map((agency) => AgencySerializer.serialize(agency))
    //   );

    const serializedGuide = await GuideSerializer.serialize(guide);
    console.log(serializedGuide);


    return res.status(200).json({
      status: "success",
      message: "Guide fetched successfully",
      guide: serializedGuide,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: error, message: "Internal server error" });
  }
}

async function submitRating(req, res) {
  const { guideId, user, rating, comment } = req.body;
  console.log("rating", req.body)

  const ratingInt = parseInt(rating, 10);

  if (!guideId || !user || !ratingInt || ratingInt < 1 || ratingInt > 5) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const newRating = await RatingService.addRating(guideId, 'Guide', user._id, parseInt(rating), comment);

    const updatedAverageRating = await RatingService.calculateAverageRating(guideId, 'Guide');
    await Guide.findByIdAndUpdate(guideId, { averageRating: updatedAverageRating });

    return res.status(200).json({
      status: 'ok',
      message: 'Rating submitted successfully',
      rating: newRating,
      averageRating: updatedAverageRating,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getGuide,
  submitRating
};
