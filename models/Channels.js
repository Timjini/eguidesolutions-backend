const mongoose = require('../db');
const uuid = require('uuid'); // Import the UUID library
const Tour = require('./Tours');

const ChannelType = {
    PRIVATE: 'private',
    PUBLIC: 'public',
};

const channelSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true, default: generateChannelId },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: Object.values(ChannelType), default: ChannelType.PUBLIC },
    code: { type: String, required: true, unique: true, default: generateChannelCode },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    starting_date: { type: Date },
    ending_date: { type: Date },
    agoraToken: { type: String },
});

// define channel name as tour.title 



function generateChannelId() {
  const channelId = uuid.v4().toString();
  return channelId;
}


function generateChannelCode() {
  const characters = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// channelSchema.pre('save', async function (next) {
//   try {
//       // Assuming you have a reference to the associated Tour document
//       const tour = await Tour.findById(this.tour);

//       // Set starting_date and ending_date based on the associated Tour
//       this.starting_date = tour.starting_date;
//       this.ending_date = tour.ending_date;

//       next();
//   } catch (error) {
//       next(error);
//   }
// });
channelSchema.virtual('channelName').get(function () {
  if (this.tour && this.tour.title) {
      return this.tour.title;
  } else {
      return null; 
  }
});


channelSchema.set('toJSON', { virtuals: true });

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;