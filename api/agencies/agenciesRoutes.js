const express = require('express');
const router = express.Router();
const Agency = require('../../models/Agency');
const User = require('../../models/Users');
const Guide = require('../../models/Guide');
const multer = require('multer');
const path = require('path');
const { isAgencyOwner, isAdministrator } = require('../../auth/auth');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const secretKey = process.env.TOKEN_KEY;




// Define storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post('/create_agency', upload.single('image'), async (req, res) => {
    try {
        console.log(req.body)
        const { name, description } = req.body;
        const image = req.file.filename;

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
            image,
            description,
        });

        await agency.save();

        res.status(201).json({ message: 'Agency created successfully', agency });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/create_agent', isAgencyOwner, upload.single('avatar'), async (req, res) => {
    try {
      const { name, email, password, type, phone } = req.body;
      const avatar = req.file.filename;
      const agency = await Agency.findOne({ owner: req.user._id });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuid.v4();
      const authToken = jwt.sign({ id }, secretKey, { expiresIn: '24h' });
  
      // Create a new user
      const user = new User({
        id,
        name,
        email,
        password: hashedPassword,
        type,
        phone,
        avatar,
        authToken,
      });
  
      // Create a new guide if the user type is 'guide'
      if (type === 'guide') {
        const guide = new Guide({
          agency: agency._id, // Assuming agency._id is the reference in Guide model
          user: user._id, // Assuming user._id is the reference in Guide model
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
