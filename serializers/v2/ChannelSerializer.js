const User = require("../../models/Users");
const Guide = require("../../models/Guide");
const Channel = require("../../models/Channels");
const Tour = require("../../models/Tours");



class ChannelSerializer {
    static async serialize(channel) {
       const requestedChannel = await Channel.findOne({ code: channel.code });
      if (!requestedChannel) {
        return null;
      }
  
      let channelGuide = null;
      let channelGuideUser = null;
      
      if (channel.guide) {
        channelGuide = await Guide.findById(channel.guide).exec();
        if (channelGuide && channelGuide.user) {
          channelGuideUser = await User.findById(channelGuide.user).exec();
        }
      }
      const guidePromise = User.findById(channelGuideUser._id).exec();
      const participants = await User.find({ '_id': { $in: requestedChannel.participants } }).exec();
      const tourPromise = Tour.findById(requestedChannel.tour).exec(); 

      const [guide, tour] = await Promise.all([guidePromise, tourPromise]);

  
      return {
        _id: requestedChannel._id,
        id: requestedChannel.id,
        type: requestedChannel.type,
        code: requestedChannel.code,
        guide: guide,
        tour : tour,
        participants: participants ,
        createdAt: requestedChannel.createdAt,
        updatedAt: requestedChannel.updatedAt,
      };
    }
  }
  
  
module.exports = ChannelSerializer;
