const express = require('express');
const router = express.Router();
const Channel = require('../../models/Channels');
const User = require('../../models/Users');
const Tour = require('../../models/Tours');
const Guide = require('../../models/Guide');
const Agency = require('../../models/Agency');


// API endpoint to join a room
router.post('/join', async (req, res) => {
  const { roomId, code } = req.body;

  try {
    // Find the room by roomId and code (if provided)
    const channel = await Channel.findOne({ channelId, code });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found or invalid code' });
    }

    // Add the user to the room's participants array
    channel.participants.push(req.user._id); // Assuming you have authentication middleware
    await channel.save();

    res.json({ message: 'Joined the room successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
  
      // Create a new room with the owner set to the found user
      const newChannel = new Channel({
        type,
        owner: user._id,
      });
  
      await newChannel.save();
  
      res.json({ message: 'Channel created successfully', channelId: newChannel.channelId, code: newChannel.code });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


module.exports = router;
