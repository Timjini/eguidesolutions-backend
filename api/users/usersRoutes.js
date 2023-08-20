const express = require('express');
const router = express.Router();
const verifyToken = require('../../auth/authMiddleware');
const secretKey = "f5a2d3689d92485dc11c43d788dd84b3e238e1a59b72d410e0b7dff3b57ea2ab"
// const { v4: uuidV4 } = require('uuid');
const multer = require('multer');
const uuid = require('uuid'); // Import the UUID library
const User = require('../../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const path = require('path'); // Add this line
const { error } = require('console');

const storage = multer.diskStorage({
  destination: path.join(__dirname, './public/uploads'),
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    callback(null, uniqueSuffix + extension);
  },
});

  
const upload = multer({ storage });


router.post('/sign_up', async (req, res) => {
    const id = uuid.v4();
    const { email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid.v4(); // Generate a unique user ID
    const authToken = jwt.sign({ userId }, secretKey, { expiresIn: '24h' });

    console.log(req.body);
  
    try {
      const user = new User({
        id,
        email,
        password: hashedPassword,
        phone,
        authToken,
      });
  
      await user.save();
      res.status(201).json({ message: 'User registered successfully', authToken });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while registering user' });  
      console.log(error);
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
    const updatedUser = await User.findOne({ _id: user._id });

    try {
      if (user.authToken) {
        // Verify the existing token
        jwt.verify(user.authToken, secretKey);

        // Use the existing token if it's still valid
        res.json({ token: user.authToken, user: updatedUser });
      } else {
        // Generate a new token if the user doesn't have a token
        const tokenExpiration = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60); // 2 months
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: tokenExpiration });

        // Update the user's authToken field in the database
        await User.updateOne(
          { _id: user._id },
          { $set: { authToken: token } }
        );

        res.json({ token, user: updatedUser });
      }
    } catch (error) {
      // If the token verification fails, generate a new token
      const tokenExpiration = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60); // 2 months
      const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: tokenExpiration });

      // Update the user's authToken field in the database
      await User.updateOne(
        { _id: user._id },
        { $set: { authToken: token } }
      );

      res.json({ token, user: updatedUser });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while logging in' });
    console.log(error);
  }
});



router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Decode the authToken from the request headers
    const authToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = jwt.verify(authToken, secretKey);

    // Use the decoded userId to fetch user data
    const user = await User.findOne({ id: decodedToken.userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's status to "offline" in the database
    await User.updateOne(
      { _id: user._id },
      { $set: { status: 'offline' } }
    );
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ error: 'An error occurred while logging out' });
    console.log(error);
  }
});


router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // Update the user's avatar field in the database with the file path
      const user = await User.findByIdAndUpdate(
        req.user.userId, // Use req.user instead of req.userId
        { avatar: req.file.filename }, // Assuming your user model has an 'avatar' field
        { new: true },
      );
      console.log(user);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'Avatar uploaded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while uploading the avatar' });
    }
  });

  router.post("/user_data", verifyToken, async (req, res) => {
    try {
      // Decode the authToken from the request headers
      const authToken = req.headers.authorization?.split(' ')[1];
      const decodedToken = jwt.verify(authToken, secretKey);
  
      // Use the decoded userId to fetch user data
      const user = await User.findOne({ id: decodedToken.userId });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return all user data
      res.json({ message: 'User Data from database', user });
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


  module.exports = router;