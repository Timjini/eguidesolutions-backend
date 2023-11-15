require('dotenv').config();
const express = require('express');
const router = express.Router();
const verifyToken = require('../../auth/authMiddleware');
const secretKey = process.env.JWT_SECRET_KEY;
// const { v4: uuidV4 } = require('uuid');
const multer = require('multer');
const uuid = require('uuid'); // Import the UUID library
const User = require('../../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Agency = require('../../models/Agency');


const path = require('path'); // Add this line
const { error } = require('console');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads'),
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    callback(null, uniqueSuffix + extension);
  },
});

  
const upload = multer({ storage });


// ... Other imports and configurations

router.post('/sign_up', upload.single('avatar'), async (req, res) => {
  const id = uuid.v4();
  const { email, password, phone, username,type } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuid.v4(); // Generate a unique user ID
  const authToken = jwt.sign({ userId }, secretKey, { expiresIn: '90d' });

  try {
    const user = new User({
      id,
      email,
      password: hashedPassword,
      phone,
      type,
      authToken,
      username,
      avatar: req.file ? req.file.filename : null, // Use the uploaded filename if available
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', authToken });
    console.log(user);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while registering user' });
    console.log(error);
  }
});


router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {

    console.log('Uploaded File:', req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Update the user's avatar field in the database with the file path
    await User.updateOne(
      { _id: req.user.userId }, // Assuming the userId is available in req.user
      { avatar: req.file.filename }
    );
    console.log(req.file.filename)

    res.status(200).json({ message: 'Avatar uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while uploading the avatar' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update the user's status to "online" in the database
    await User.updateOne(
      { _id: user._id },
      { $set: { status: 'online' } }
    );

    // Fetch the updated user with the new status from the database
    const agency = await Agency.findOne({members: { _id: user._id}}) || null;
    const updatedUser = await User.findOne({ _id: user._id });
    const userAvatar = updatedUser.avatar
      ? path.join(__dirname, '../public/uploads', updatedUser.avatar)
      : path.join(__dirname, '../public/uploads', 'user.png');


      try {
        if (user.authToken) {
          // Verify the existing token
          jwt.verify(user.authToken, secretKey, (err, decoded) => {
            if (err) {
              // Token is invalid or expired, generate a new one
              const tokenExpiration = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60); // 2 months
              const newToken = jwt.sign({ userId: user.id }, secretKey, { expiresIn: tokenExpiration });
      
              // Update the user's authToken field in the database
              user.authToken = newToken;
              user.save(); // Save the updated token to the user record in the database
      
              // Send the new token to the client
              res.json({ token: newToken, user: { ...updatedUser._doc, agency: agency.name }, userAvatar, agency: agency });
            } else {
              // Use the existing token if it's still valid
              res.json({ token: user.authToken, user: { ...updatedUser._doc, agency: agency }, userAvatar, agency: agency });
            }
          });
        } else {
          // Generate a new token if the user doesn't have a token
          const tokenExpiration = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60); // 2 months
          const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: tokenExpiration });
      
          // Update the user's authToken field in the database
          user.authToken = token;
          user.save(); // Save the new token to the user record in the database
      
          res.json({ token, user: updatedUser });
        }
      } catch (error) {
        // Handle other errors as needed
        console.error(error);
      }
      
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while logging in' });
    console.log(error);
  }
});



router.post('/logout', verifyToken, async (req, res) => {
  try {
    console.log(req)
    // Decode the authToken from the request headers
    const authToken = req.headers.authorization?.split(' ')[1];
    console.log(authToken);
    // const decodedToken = jwt.verify(authToken, secretKey);

    // Use the decoded userId to fetch user data  
    const user = await User.findOne({ authToken: authToken });
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    

    // Update the user's status to "offline" in the database
    await User.updateOne(
      { _id: user._id },
      { $set: { status: 'offline' } }
    );
    res.json({ message: 'Logged out successfully' });
    console.log("user logged out successfully")
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ error: 'An error occurred while logging out' });
    console.log(error);
    console.log(req)
  }
});


router.get('/users', async function(req, res) {
  const authToken = req.headers.authorization?.split(' ')[1];

  if (!authToken) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      // Find the user based on the authToken
      const user = await User.findOne({ authToken: authToken }).exec();
      console.log(user);

      if (!user) {
          return res.status(401).json({ message: 'Invalid token' });
      }

      // Check if the user has necessary permissions (e.g., admin role)
      if (user.type !== 'admin') {
          return res.status(403).json({ message: 'Access forbidden' });
      }

      // Fetch all users from the database
      const users = await User.find({}, '-password').exec();

      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: 'Error processing request' });
  }
});

// router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//       }
  
//       // Update the user's avatar field in the database with the file path
//       const user = await User.findByIdAndUpdate(
//         req.user.userId, // Use req.user instead of req.userId
//         { avatar: req.file.filename }, // Assuming your user model has an 'avatar' field
//         { new: true },
//       );
//       console.log(user);
  
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       res.status(200).json({ message: 'Avatar uploaded successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'An error occurred while uploading the avatar' });
//     }
//   });

router.delete('/delete_account', async (req, res) => {
  const authToken = req.headers.authorization?.split(' ')[1];

  try {
    // Find the user by ID
    const user = await User.findOne({ authToken: authToken }).exec();
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user from the database
    await User.deleteOne( { _id: user._id });

    // Optionally, you can also revoke the user's authentication token here if needed
    // await User.updateOne({ _id: userId }, { $unset: { authToken: 1 } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the user' });
    console.error(error);
  }
});

  router.post("/user_data", verifyToken, async (req, res) => {
    try {
      // Decode the authToken from the request headers
      const authToken = req.headers.authorization?.split(' ')[1];
      // const decodedToken = jwt.verify(authToken, secretKey);
  
      // Use the decoded userId to fetch user data
      const user = await User.findOne({ authToken: authToken });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const avatarFilePath = path.join(__dirname, '../public/uploads', user.avatar);
  
      // Return all user data
      res.json({ message: 'User Data from database', user, avatarFilePath });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(500).json({ error: 'An error occurred while fetching user data' });
      console.log(error);
    }
  });
  

router.post('/secure_route', verifyToken, async (req, res) => {
    try {
      console.log(req.userId)
  
      const user = await User.findOne(req.userId); // Fetch user data based on userId
      if (!user) {
        console.log("not found")
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the user's data in the response
      res.status(200).json({ message: 'You have access to this secure route!', user });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'An error occurred while fetching user data' });
    }
  });

  // router to get guides 
  router.get('/guides', async function(req, res) {
    const authToken = req.headers.authorization?.split(' ')[1];
  
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
        // Find the user based on the authToken
        const user = await User.findOne({ authToken: authToken }).exec();
        console.log(user);
  
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
  
        // Check if the user has necessary permissions (e.g., admin role)
        if (user.type !== 'admin' && user.type !== 'owner') {
            return res.status(403).json({ message: 'Access forbidden' });
        }
  
        // Fetch all users from the database
        const guides = await User.find({type: "guide"}, '-password').exec();
        // populate with user information
        // const guides = await Guide.find({ agency: agency }).exec();
  
        res.status(200).json(guides);
    } catch (error) {
        res.status(500).json({ message: 'Error processing request' });
    }
  });


  module.exports = router;