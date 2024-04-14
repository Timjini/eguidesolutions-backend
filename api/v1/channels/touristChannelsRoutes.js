const express = require("express");
const router = express.Router();
const ChannelController = require("../../../controllers/channelController");

router.post("/", ChannelController.joinChannel);
router.post("/user_channels", ChannelController.userChannels);
router.post("/get_channel", ChannelController.getChannel);

module.exports = router;
