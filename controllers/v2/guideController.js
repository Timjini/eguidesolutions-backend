const Guide = require("../../models/Guide");
const GuideSerializer = require("../../serializers/v2/GuideSerializer");

async function getGuide(req, res) {
  try {
    const guideId = req.body.guideId._id;
    console.log(guideId);
    const guide = await Guide.findOne({ _id: guideId });
    console.log("guide----->", guide);

    // Serialize each agency using the updated serializer
    //   const serializedAgencies = await Promise.all(
    //     agencies.map((agency) => AgencySerializer.serialize(agency))
    //   );

    const serializedGuide = await GuideSerializer.serialize(guide);

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

module.exports = {
  getGuide,
};
