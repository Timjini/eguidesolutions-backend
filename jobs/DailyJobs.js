const cron = require("node-cron");
const Channel = require("../models/Channels");

const removeExpiredChannels = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const allChannels = await Channel.find();
            console.log("All Channels: ", allChannels);

        } catch (error) {
            console.error("Error fetching channels: ", error);
        }
    });
};

module.exports = { removeExpiredChannels };
