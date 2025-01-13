const express = require('express');
const router = express.Router();
const Agency = require('../../models/Agency');
const User = require('../../models/Users');
const Guide = require('../../models/Guide');
const Tour = require('../../models/Tours');
const { isAgencyOwner, isAdministrator } = require('../../auth/auth');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const { upload, uploadToS3 } = require('../../fileUploader');
const Channel = require('../../models/Channels');
const sendPasswordResetEmail = require('../../mailer/resetPassword');
const crypto = require('crypto');


// #### ALL POST REQUESTS 

// =======================================================================================================================================
//==============> Creating agency currently available only on postman ========================>
// =======================================================================================================================================

router.post('/create_agency', async (req, res) => {
  consol.log('creating agency', req.body)
    try {
        const { name, description } = req.body;
        const file = req.file;
        const photo = await uploadToS3(file);

        const authToken = req.headers.authorization?.split(' ')[1];
        const user = await User.findOne({ authToken: authToken });
        if (!user.isAgencyOwner) {
            user.isAgencyOwner = true;
            await user.save();
        }


        // Create a new agency document
        const agency = new Agency({
            name,
            owner: user._id,
            members: [user._id],
            image:photo.file_name, 
            description,
        });


        await agency.save();
        await User.updateOne({ _id: user._id }, { ownedAgency: agency._id });


        res.status(201).json({ message: 'Agency created successfully', agency , user:user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Internal server error ${error}` });
    }
});

// =======================================================================================================================================
//==========================================================> Creating an agent/ Guide by Agency Admin User (agency/owner)
// =======================================================================================================================================

router.post('/create_agent', async (req, res) => {
    try {
      const { name, email, password, type, phone } = req.body;
      const file = req.file;
      const avatar = await uploadToS3(file);
      const agency = await Agency.findOne({ _id: req.body.agencyId });
    
  
      // Generate a unique token
      const token = crypto.randomBytes(32).toString('hex');
      const id = uuid.v4();
      const authToken = jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: '72h' });
  
      // Create a new user
      const user = new User({
        id,
        name,
        email,
        password: '$43$!^^&@',
        type,
        phone,
        avatar: avatar.file_name,
        authToken,
        resetPasswordToken: token,
      });
  
      if (type === 'guide') {
        const guide = new Guide({
          agency: agency._id, 
          user: user._id, 
        });
        await guide.save();
      }
  
      agency.members.push(user._id);

      await sendPasswordResetEmail(user);
      await Promise.all([user.save(), agency.save()]);
  
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// =======================================================================================================================================
//==========================================================> Agency Data for the Dashboard Cards 
// =======================================================================================================================================


router.post('/agency_data', async function (req, res) {
  const { agencyId } = req.body.body;

  const authToken = req.body.headers.Authorization?.split(' ')[1];
  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {

    const agency = await Agency.findOne({ _id: agencyId });

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found for the user' });
    }
    const guidesCount = await Guide.find({agency: agency});
    const channelsCount = await Channel.countDocuments({ agency: agencyId });
     
    const channels = await Channel.find({ agency: agencyId });
    
    const touristsCount = channels
      .filter((channel) => channel.participants.length)
      .reduce((acc, channel) => acc + channel.participants.length, 0);

    res.status(200).json({ message: 'Agency Data', guides: guidesCount?.length, channels: channelsCount, tourists: touristsCount});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the guides' });
  }

});




// #### ALL GET REQUESTS 

// =======================================================================================================================================
//==========================================================> Getting all needed members using agency Id
// =======================================================================================================================================



  router.get('/members', async (req, res) => {
    const { agencyId } = req.query;
  
    try {
      const authToken = req.headers.authorization?.split(' ')[1];
  
      if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const user = await User.findOne({ authToken: authToken }).exec();
  
      // Check if the user is an admin and agencyId is null
      if (user.type === 'admin' && agencyId === null || agencyId === undefined) {
        const allUsers = await User.find();
        return res.status(200).json({ message: 'All Users', members: allUsers });
      }
  
      const agency = await Agency.findOne({ _id: agencyId });
  
      if (!agency) {
        return res.status(404).json({ message: 'Agency not found' });
      }
  
      const memberIds = agency.members; // Array of user IDs
  
      // Find user documents by their IDs 
      const users = await User.find({ _id: { $in: memberIds } });
  
      res.status(200).json({ message: 'Agency Users', members: users, agency: agency });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// =======================================================================================================================================
//==========================================================> Creating a channel for agency using Agency ID
// =======================================================================================================================================


router.get('/agency_channels', async function (req, res) {
  const { agencyId } = req.query;

  const authToken = req.headers.authorization?.split(' ')[1];
  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findOne({ authToken: authToken }).exec();

    // Check if the user is an admin and agencyId is null
    if (user.type === 'admin' && agencyId === undefined || agencyId === null) {
      const allChannels = await Channel.find()
        .populate({
          path: 'guide',
          populate: { path: 'user', select: 'name avatar' }
        })
        .populate('tour');
        
      return res.status(200).json({ message: 'All Channels', channels: allChannels });
    }

    const agency = await Agency.findOne({ owner: user._id });

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found for the user' });
    }

    // Find channels based on the provided agencyId
    const channels = await Channel.find({ agency: agencyId })
      .populate({
        path: 'guide',
        populate: { path: 'user', select: 'name avatar' }
      })
      .populate('tour');

    res.status(200).json({ message: 'Agency Channels', channels: channels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the channels' });
  }
});


// =======================================================================================================================================
//==========================================================> Getting All Agencies for App Administrator
// =======================================================================================================================================


router.get('/all_agencies' , isAdministrator, async (req, res) => {

    try {
    const agencies = await Agency.find();

    res.status(200).json({
      message: 'Agencies fetched successfully',
      agencies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});





module.exports = router;
