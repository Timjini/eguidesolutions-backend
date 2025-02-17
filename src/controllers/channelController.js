const Channel = require("../models/Channels");
const User = require("../models/Users");

async function joinChannel(req, res) {
  try {
    const { code, token, userId } = req.body;
    const user = await User.findOne({ _id: userId });
    const channel = await Channel.findOne({ code });

    if (!channel) {
      return res.status(404).json({
        status: "error",
        message: "Wrong code please contact your Guide",
      });
    }

    channel.participants.addToSet(user._id);
    await channel.save();

    res.status(200).json({
      status: "success",
      message: "Channel joined successfully",
      channel: { code: code },
    });
  } catch (error) {}
}

async function userChannels(req, res) {
  try {
    const { userId } = req.body;
    // const user = await User.findOne({ _id: userId });
    console.log("User:", userId);

    const channels = await Channel.find({ participants: userId })
      .populate({
        path: "guide",
        populate: { path: "user", select: "name avatar" },
      })
      .populate("tour");

    res
      .status(200)
      .json({ status: "success", message: "User channels", channels });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error fetching user channels" });
  }
}

async function getChannel(req, res) {
  try {
    const { code } = req.body;
    const channel = await Channel.findOne({ code });

    if (!channel) {
      return res.status(404).json({
        status: "error",
        message: "Channel not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Channel details",
      channel: { code: code },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

module.exports = {
  joinChannel,
  userChannels,
  getChannel,
};
