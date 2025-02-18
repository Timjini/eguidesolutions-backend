const cron = require('node-cron');
const moment = require('moment');
const Channel = require('../models/Channels');
const JobLog = require('../models/JobLog');
const AgoraChannel = require('../services/AgoraChannel');

async function handleChannel(channelCode) {
    try {
      const agoraChannel = new AgoraChannel(channelCode);
      const token = await agoraChannel.getOrCreateToken();
  
      console.log(`Agora Token for channel ${channelCode}:`, token);
  
      const isClosed = await agoraChannel.isChannelClosed();
      console.log(`Is Channel ${channelCode} closed?`, isClosed);
  
      if (isClosed) {
        const newToken = await agoraChannel.ensureChannelActive();
        console.log(`Regenerated Token:`, newToken);
      }
    } catch (error) {
      console.error('Error handling Agora channel:', error);
    }
  }

  async function logJobExecution(jobName, status, errorMessage = '', data = []) {
    try {
      await JobLog.create({
        jobName,
        status,
        errorMessage,
        data: [],
      });
      console.log(`Job log saved for ${jobName} with status: ${status}`);
    } catch (err) {
      console.error('Failed to log job execution:', err);
    }
  }

function initializeDailyJobs() {
  // Schedule the token refresh job
  // '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    const jobName = 'Daily Token Refresh';
    try {
      const today = moment().startOf('day');
      const channels = await Channel.find({
        start_date: today.toDate(),
        end_date: { $gt: today.toDate() },
      });

      for (const channel of channels) {
        await handleChannel(channel.code);
      }
      await logJobExecution(
        jobName,
        'success',
        '',
        channels.map(channel => ({
          id: channel._id,
          code: channel.code,
          start_date: channel.starting_date,
          end_date: channel.ending_date,
        }))
      );
      console.log('Daily token refresh job completed successfully.');
    } catch (error) {
      console.error('Error in daily token refresh job:', error);
      await logJobExecution(jobName, 'error', error.message || 'Unknown error');
    }
  });

  console.log('Daily jobs initialized.');
}

module.exports = initializeDailyJobs;
