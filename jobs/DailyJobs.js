const cron = require("node-cron");
const Channel = require("../models/Channels");

const removeExpiredChannels = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const allChannels = await Channel.find();
            console.log("All Channels: ", allChannels);

            const now = new Date();
            const expiredChannels = allChannels.filter(channel => channel.ending_date < now);

            const expiredChannelIds = expiredChannels.map(channel => channel._id);
            await Channel.deleteMany({ _id: { $in: expiredChannelIds } });

            console.log("Expired Channels Removed: ", expiredChannels);
        } catch (error) {
            console.error("Error fetching channels: ", error);
        }
    });
};

module.exports = { removeExpiredChannels };
