const cron = require("node-cron");
const Channel = require("../models/Channels");

const removeExpiredChannels = () => {
    cron.schedule('0 0 * * *', async () => { // This runs the task every day at midnight
        try {
            const now = new Date();
            const expiredChannels = await Channel.find({ ending_date: { $lt: now } });

            if (expiredChannels.length > 0) {
                for (const channel of expiredChannels) {
                    await Channel.deleteOne({ _id: channel._id });
                    console.log("Deleted Channel: ", channel);
                }
            } else {
                console.log("No expired channels found!");
            }
        } catch (error) {
            console.error("Error fetching or deleting channels: ", error);
        }
    });
};

module.exports = { removeExpiredChannels };
