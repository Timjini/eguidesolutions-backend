const express = require('express');
const router = express.Router();
const Agency = require('../../models/Agency');
const User = require('../../models/Users');
const Guide = require('../../models/Guide');
const { isAgencyOwner, isAdministrator } = require('../../auth/auth');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const { upload, uploadToS3 } = require('../../fileUploader');



router.post('/create_agency', async (req, res) => {
    try {
        console.log(req.body)
        const { name, description } = req.body;
        const file = req.file;
        console.log(req.body)
        const photo = await uploadToS3(file);

        const authToken = req.headers.authorization?.split(' ')[1];
        const user = await User.findOne({ authToken: authToken });

        // Update user to agency owner
        if (!user.isAgencyOwner) {
            // Update the user's isAgencyOwner field to true
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
  
      // Create a new guide if the user type is 'guide'
      if (type === 'guide') {
        const guide = new Guide({
          agency: agency._id, 
          user: user._id, 
        });
        await guide.save();
      }
  
      // Add the user to the agency's members array
      agency.members.push(user._id);
  
      // Save both the user and the agency
      await Promise.all([user.save(), agency.save()]);
  
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


router.get('/members', isAgencyOwner, async (req, res) => {
    try {
        const agency = await Agency.findOne({ owner: req.user._id });

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


module.exports = router;
