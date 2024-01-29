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


// #### ALL POST REQUESTS 

// =======================================================================================================================================
//==============> Creating agency currently available only on postman ========================>
// =======================================================================================================================================

router.post('/create_agency', async (req, res) => {
    try {
        console.log(req.body)
        const { name, description } = req.body;
        const file = req.file;
        console.log(req.body)
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

        res.status(201).json({ message: 'Agency created successfully', agency });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// =======================================================================================================================================
//==========================================================> Creating an agent/ Guide by Agency Admin User (agency/owner)
// =======================================================================================================================================

router.post('/create_agent', async (req, res) => {
    try {
      console.log(req.body)
      const { name, email, password, type, phone } = req.body;
      const file = req.file;
      const avatar = await uploadToS3(file);
      const agency = await Agency.findOne({ _id: req.body.agencyId });
      console.log(agency)
    
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuid.v4();
      const authToken = jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: '72h' });
  
      // Create a new user
      const user = new User({
        id,
        name,
        email,
        password: hashedPassword,
        type,
        phone,
        avatar: avatar.file_name,
        authToken,
      });
  
      if (type === 'guide') {
        const guide = new Guide({
          agency: agency._id, 
          user: user._id, 
        });
        await guide.save();
      }
  
      agency.members.push(user._id);
  
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
  console.log("body", req.body)
  console.log("agency fetch" , agencyId);

  const authToken = req.body.headers.Authorization?.split(' ')[1];
  console.log("authToken", authToken)
  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {

    const agency = await Agency.findOne({ _id: agencyId });
    console.log("agnecy here" ,agency);

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found for the user' });
    }

    const guidesCount = await Guide.find({agency: agency}).count();
    console.log(guidesCount);
    const channelsCount = await Channel.countDocuments({ agency: agencyId });
     
    const channels = await Channel.find({ agency: agencyId });
    
    const touristsCount = channels
      .filter((channel) => channel.participants.length)
      .reduce((acc, channel) => acc + channel.participants.length, 0);

    res.status(200).json({ message: 'Agency Data', guides: guidesCount, channels: channelsCount, tourists: touristsCount});
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
    console.log("members method", agencyId);
  
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
  
      console.log(users);
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
  console.log(agencyId);

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
