const express = require('express');
const router = express.Router();
const Agency = require('../../models/Agency');
const User = require('../../models/Users');
const Guide = require('../../models/Guide');
const Tour = require('../../models/Tours');
const { isAdministrator } = require('../../auth/auth');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const { upload, uploadToS3 } = require('../../fileUploader');
const Channel = require('../../models/Channels');
const sendPasswordResetEmail = require('../../mailer/resetPassword');
const crypto = require('crypto');

// #### ALL GET REQUESTS 

// =======================================================================================================================================
//==========================================================> Getting all data for dashboard
// =======================================================================================================================================


router.get('/dashboard',isAdministrator , async (req, res) => {

    try {

    // Get count of all agencies , guides , users , and tours
    const agencyCount = await Agency.countDocuments();
    const userCount = await User.countDocuments();
    const guideCount = await Guide.countDocuments();
    const tourCount = await Tour.countDocuments();
    const channelCount = await Channel.countDocuments();

    const channels = await Channel.find();
    const touristCount = channels
    .filter((channel) => channel.participants.length)
    .reduce((acc, channel) => acc + channel.participants.length, 0);

    res.status(200).json({
      agencyCount,
      userCount,
      guideCount,
      tourCount,
      channelCount,
      touristCount
    });

  } catch (error) {
    res.status(500).json({message: error});
  }

});


// =======================================================================================================================================
//==========================================================> Getting all Data 
// =======================================================================================================================================

// getting Guides 
router.get('/guides', isAdministrator, async (req, res) => {
    try {

    const guides = await Guide.find();
    const populatedWithUsers = await User.find({type: 'guide'});
    guides.forEach(guide => {
        guide.user = populatedWithUsers.find(user => user._id.toString() === guide.user.toString());
    });

    res.status(200).json({guides:populatedWithUsers, message:'success'});

  } catch (error) {

    res.status(500).json({message: error});

  }
});

// Getting Tours 
router.get('/tours', isAdministrator, async (req, res) => {
    try {

    const tours = await Tour.find();
    const populatedWithGuides = await Guide.find();
    tours.forEach(tour => {
        tour.guide = populatedWithGuides.find(guide => guide._id.toString() === tour.guide.toString());
    });

    res.status(200).json({tours:tours,guides: populatedWithGuides, message:'Tours fetched successfully'});

  } catch (error) {

    res.status(500).json({message: error});

  }
});

// Getting Channels 
router.get('/channels', isAdministrator, async (req, res) => {
    try {

    const channels = await Channel.find();
    const populatedWithGuides = await Guide.find();
    const populatedWithTours = await Tour.find();
    channels.forEach(channel => {
        channel.guide = populatedWithGuides.find(guide => guide._id.toString() === channel.guide.toString());
        channel.tour = populatedWithTours.find(tour => tour._id.toString() === channel.tour.toString());
    });

    res.status(200).json({channels:channels, message:'Channels fetched successfully'});

  } catch (error) {

    res.status(500).json({message: error});

  }
});



// #### ALL POST REQUESTS 

// =======================================================================================================================================
//==========================================================> Creating an agency owner
// =======================================================================================================================================

router.post('/create_agency_owner', isAdministrator, async (req, res) => {
    try {

    const file = req.file;
    const avatar = await uploadToS3(file);
    const { name, email, phone } = req.body;

    // Validate user input
    if(!name || !email) {
      return res.status(400).send("All input is required");
    }

    // check if user already exist
    const userExists = await User.findOne({email: email});

    if(userExists) {
      return res.status(409).send("User already exists with that email");
    }

    const id = uuid.v4();
    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');
    const authToken = jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: '72h' });

    // Create user
    const user = await User.create({
        id,
        name,
        email,
        type:"owner",
        password:"null",
        isAgencyOwner: true,
        phone,
        avatar: avatar.file_name,
        authToken,
        resetPasswordToken: token,
    });

    await sendPasswordResetEmail(user);

    res.status(201).json({
      user,
      message: 'User created successfully. Check your email for password reset instructions.',
    });

  } catch (error) {

    res.status(500).send('Error creating user');

  }
});



module.exports = router;
