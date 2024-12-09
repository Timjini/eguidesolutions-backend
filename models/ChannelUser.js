const mongoose = require('../db');

const ChannelUserSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, required: true, default: Date.now },
  leftAt: { type: Date },
  isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });

ChannelUserSchema.index({ channel: 1, user: 1 }, { unique: true });

const ChannelUser = mongoose.model('ChannelUser', ChannelUserSchema);

module.exports = ChannelUser;
