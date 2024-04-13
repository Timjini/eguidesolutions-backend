const Favorite = require("../models/Favorite");

async function addToFavorite(req, res) {
  try {
    const { userId, tourId } = req.body;
    const favorite = new Favorite({
      user: userId,
      tour: tourId,
      isFavorite: true,
    });
    await favorite.save();

    if (favorite) {
      return res.status(201).json({
        status: "success",
        message: "Tour added to favorites successfully",
        favorite,
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Failed to add tour to favorites",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function removeFromFavorite(req, res) {
  try {
    const { userId, tourId } = req.body;
    const favorite = await Favorite.findOneAndUpdate(
      { user: userId, tour: tourId },
      { $set: { isFavorite: false } }
    );

    if (favorite) {
      return res.status(200).json({
        status: "success",
        message: "Tour removed from favorites successfully",
        favorite,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Tour not found in favorites",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

module.exports = {
  addToFavorite,
  removeFromFavorite,
};
