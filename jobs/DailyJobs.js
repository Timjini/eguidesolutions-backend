const cron = require("node-cron");
const Channel = require("../models/Channels");
const { } = require("agora-access-token");

const removeExpiredChannels = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const allChannels = await Channel.find();
            console.log("All Channels: ", allChannels);

        } catch (error) {
            console.error("Error fetching channels: ", error);
        }
    });
};

module.exports = { removeExpiredChannels };
