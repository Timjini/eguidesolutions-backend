const mongoose = require('../db');
const uuid = require('uuid'); // Import the UUID library

const ChannelType = {
    PRIVATE: 'private',
    PUBLIC: 'public',
};

const channelSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true, default: generateChannelId },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: Object.values(RoomType), default: ChannelType.PUBLIC },
    code: { type: String, required: true, unique: true, default: generateChannelCode },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

function generateChannelId() {
  const channelId = uuid.v4().toString
  return channelId;
}

function generateChannelCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
  console.log(code);
}


const Room = mongoose.model('Channel', channelSchema);

module.exports = Room;