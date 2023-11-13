const express = require('express');
const router = express.Router();
const Channel = require('../../models/Channels');
const User = require('../../models/Users');
const Tour = require('../../models/Tours');
const Guide = require('../../models/Guide');
const Agency = require('../../models/Agency');


  // API endpoint to create a room
  router.post('/create', async (req, res) => {
    const { type } = req.body;
    const authToken = req.headers.authorization?.split(' ')[1];
  
    if (!authToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      // Find the user by authToken
      const user = await User.findOne({ authToken });
      if (!user) {
        return res.status(401).json({ message: 'User not found or invalid token' });
      }
  
      // Find the agency owned by the user
      const agency = await Agency.findOne({ owner: user._id });
      if (!agency) {
        return res.status(404).json({ message: 'Agency not found for the user' });
      }

      // Find the tour for the agency (assuming you have a proper query logic here)
      const tour = await Tour.findOne({ agency: agency._id });
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found for the agency' });
      }
  
      const guide = await Guide.findOne({_id: tour.guide})
      // Create a new channel with the owner set to the found user
      const newChannel = new Channel({
        type,
        owner: user._id,
        agency: agency._id, // Assuming you want to store agency ID in the channel
        tour: tour._id,     // Assuming you want to store tour ID in the channel
        guide: guide
      });
  
      await newChannel.save();
  
      res.json({ message: 'Channel created successfully',  code: newChannel.code });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  

  router.get('/agency_channels', async function (req, res) {
    const authToken = req.headers.authorization?.split(' ')[1];
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await User.findOne({ authToken: authToken }).exec();
        const agency = await Agency.findOne({ owner: user._id });
        const tour = await Tour.findOne({ owner: user._id });
        // const guide = await User.findOne({ id: tour.guide._id })

        if (!agency) {
            return res.status(404).json({ message: 'Agency not found for the user' });
        }

        // Find all channels belonging to the agency using the agencyId field in the Channel schema
        const channels = await Channel.find({ agency: agency._id }).populate('guide').exec();

        res.status(200).json({ message: 'Agency Channels', channels: channels });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the channels' });
    }
});

// get channel by channel code and update participants with user authtoken

router.post('/join', async (req, res) => {
  const { code } = req.body;
  const authToken = req.headers.authorization?.split(' ')[1];

  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Find the user by authToken
    const user = await User.findOne({ authToken });
    if (!user) {
      return res.status(401).json({ message: 'User not found or invalid token' });
    }

    // Find the channel by code
    const channel = await Channel.findOne({ code });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    channel.participants.addToSet(user._id) 
    await channel.save();

    res.json({ message: 'Channel joined successfully', channel: { code: code} });
    console.log(channel.participants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
);

// get channel info using code and user auth token


router.get('/channel', async (req, res) => {
  const { code } = req.body;
  const authToken = req.headers.authorization?.split(' ')[1];

  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Find the user by authToken
    const user = await User.findOne({ authToken });
    if (!user) {
      return res.status(401).json({ message: 'User not found or invalid token' });
    }

    // Find the channel by code and populate the associated Guide and Tour data
    const channel = await Channel.findOne({ code })
      .populate({
        path: 'guide',
        populate: { path: 'user', select: 'name avatar' }
      }) // Assuming 'guide' is the field in your Channel model that references the Guide model
      .populate('tour'); // Assuming 'tour' is the field in your Channel model that references the Tour model

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ message: 'Channel found', channel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get user's channels 
router.get('/user_channels', async (req, res) => {
  const authToken = req.headers.authorization?.split(' ')[1];
  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {

    const user = await User.findOne({ authToken });
    if (!user) {
      return res.status(401).json({ message: 'User not found or invalid token' });
    }

    const channels = await Channel.find({ participants: user._id })
      .populate({
        path: 'guide',
        populate: { path: 'user', select: 'name avatar' }
      }) // Assuming 'guide' is the field in your Channel model that references the Guide model
      .populate('tour'); // Assuming 'tour' is the field in your Channel model that references the Tour model

    res.json({ message: 'User channels', channels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }

});


module.exports = router;
