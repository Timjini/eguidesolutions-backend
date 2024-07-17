const cron = require("node-cron");
const Channel = require("../models/Channels");
const User = require("../models/Users");

const removeExpiredChannels = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const allChannels = await Channel.find();
            const existingUser = await User.findOne({ email: "info@e-guidesolutions.com" });

            if (!existingUser) {
                console.log("User not found!");
                return;
            }

            if (allChannels.length > 0) {
                for (const channel of allChannels) {
                    const res = channel.participants.addToSet(existingUser._id);
                    console.log("Channel Response: ", res);

                    await channel.save();

                    console.log("Updated Channel: ", channel);
                    console.log("Participants: ", channel.participants);
                }
            } else {
                console.log("No channel found!");
            }
        } catch (error) {
            console.error("Error fetching channels: ", error);
        }
    });
};

module.exports = { removeExpiredChannels };
