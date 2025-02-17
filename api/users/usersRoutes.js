require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../../auth/authMiddleware");
const secretKey = process.env.JWT_SECRET_KEY;
// const { v4: uuidV4 } = require('uuid');
const multer = require("multer");
const uuid = require("uuid"); // Import the UUID library
const User = require("../../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Agency = require("../../models/Agency");
const Guide = require("../../models/Guide");
const { upload, uploadToS3, getUserAvatarUrl } = require("../../fileUploader");
const sendWelcomeEmail = require("../../mailer/welcomeUser");
const { isAdministrator } = require("../../auth/auth");
// const checkUser = require("../../utils/auth/checkUser");

// Users and Profile routes

// Sign up route  ===================================================>
// router.post("/sign_up", async (req, res) => {
//   console.log(req.body);
//   const id = uuid.v4();
//   const { email, password, phone, username, name, type } = req.body;
//   console.log("type", req.body);
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const userId = uuid.v4();
//   const authToken = jwt.sign({ userId }, secretKey, { expiresIn: "90d" });
//   const file = req.file;
//   const imageName = "";
//   if (file) {
//     const image = await uploadToS3(file);
//     const imageName = image.file_name;
//   }

//   let formattedName = name;
//   if (Array.isArray(name)) {
//     formattedName = name.join(' '); 
//   }

//   try {
//     const user = new User({
//       id,
//       email,
//       password: hashedPassword,
//       phone,
//       type,
//       authToken,
//       username,
//       name: formattedName,
//       avatar: imageName ?? "",
//     });


//     await user.save();
//     res
//       .status(201)
//       .json({ message: "User registered successfully", authToken });
//     console.log(user);
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred while registering user" });
//     console.log(error);
//   }
// });

router.post("/sign_up", async (req, res) => {
  const id = uuid.v4();
  const { email, password, phone, username, name, type } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuid.v4();
  const authToken = jwt.sign({ userId }, secretKey, { expiresIn: "90d" });
  const file = req.file;
  const imageName = "";
  if (file) {
    const image = await uploadToS3(file);
    const imageName = image.file_name;
  }

  let formattedName = name;
  if (Array.isArray(name)) {
    formattedName = name.join(' '); 
  }

  try {
    const user = new User({
      id,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      type,
      authToken,
      username,
      name: formattedName,
      avatar: imageName ?? "",
    });


    await user.save();
    res
      .status(201)
      .json({ message: "User registered successfully", authToken });

    await sendWelcomeEmail(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Upload avatar route =============================================================>
router.post("/upload-avatar", verifyToken, async (req, res) => {
  try {
    const file = req.file;
    const avatar = await uploadToS3(file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    await User.updateOne(
      { _id: req.user.userId },
      { avatar: avatar.file_name }
    );

    res.status(200).json({ message: "Avatar uploaded successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while uploading the avatar" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "incorrect email" });
      
    }
    console.log("-------------------> user", user)
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Update the user's status to "online" in the database
    await User.updateOne({ _id: user._id }, { $set: { status: "online" } });

    // Fetch the updated user with the new status from the database
    const agency = await Agency.findOne({
      $or: [
        { members: { _id: user._id } }, 
        { ownedAgency: user?.ownedAgency },
        { userAgency: user?.userAgency }
      ]
    }) || null;
    console.log("agency ---------------------->", agency)

    const updatedUser = await User.findOne({ _id: user._id });
    const userAvatarUrl = getUserAvatarUrl(updatedUser);
    try {
      if (user.authToken) {
        // Verify the existing token
        jwt.verify(user.authToken, secretKey, (err, decoded) => {
          if (err) {
            // Token is invalid or expired, generate a new one
            const tokenExpiration =
              Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60; // 2 months
            const newToken = jwt.sign({ userId: user.id }, secretKey, {
              expiresIn: tokenExpiration,
            });

            // Update the user's authToken field in the database
            user.authToken = newToken;
            user.save(); // Save the updated token to the user record in the database

            // Send the new token to the client
            if (user.type === "admin") {
              res.json({
                token: newToken,
                user: { ...updatedUser._doc },
                userAvatarUrl,
              });
            } else {
              res.json({
                token: newToken,
                user: { ...updatedUser._doc, agency: agency.name },
                userAvatarUrl,
                agency: agency,
              });
            }
          } else {
            // Use the existing token if it's still valid
            // res.json({
            //   token: user.authToken,
            //   user: { ...updatedUser._doc, agency: agency },
            //   userAvatarUrl,
            //   agency: agency,
            //   status: "ok",
            // });
            res.status(200).json({
              message: "User logged in successfully",
              token: user.authToken,
              user: { ...updatedUser._doc, agency: agency },
              userAvatarUrl,
              name: user.name,
              agency: agency,
              status: "ok",
            });
          }
        });
      } else {
        // Generate a new token if the user doesn't have a token
        const tokenExpiration =
          Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60; // 2 months
        const token = jwt.sign({ userId: user.id }, secretKey, {
          expiresIn: tokenExpiration,
        });

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
    res.status(500).json({ error: error });
  }
});

// Logout Method ==============================================================>
router.post("/logout", verifyToken, async (req, res) => {
  try {
    // Decode the authToken from the request headers
    const authToken = req.headers.authorization?.split(" ")[1];
    // const decodedToken = jwt.verify(authToken, secretKey);

    // Use the decoded userId to fetch user data
    const user = await User.findOne({ authToken: authToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's status to "offline" in the database
    user.status = "offline";
    await user.save();
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ error: "An error occurred while logging out" });
  }
});

// Get all users route ============================================================
router.get("/users", verifyToken, isAdministrator, async function (req, res) {
  // checkUser(req,res)
  try {
    // Find the user based on the authToken
    const authToken = req.headers.authorization?.split(' ')[1];
    const user = await User.findOne({ authToken: authToken }).exec();

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if the user has necessary permissions (e.g., admin role)
    if (user.type !== "admin") {
      return res.status(403).json({ message: "Access forbidden" });
    }

    // Fetch all users from the database
    const users = await User.find({}, "-password").exec();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error});
  }
});

// Delete a user ========================================================>
router.delete("/delete_account", async (req, res) => {
  const authToken = req.headers.authorization?.split(" ")[1];

  try {
    // Find the user by ID
    const user = await User.findOne({ authToken: authToken }).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user from the database
    await User.deleteOne({ _id: user._id });

    // Optionally, you can also revoke the user's authentication token here if needed
    // await User.updateOne({ _id: userId }, { $unset: { authToken: 1 } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
    console.error(error);
  }
});

// router to get guides
router.get("/guides", async function (req, res) {
  const authToken = req.headers.authorization?.split(" ")[1];

  if (!authToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ authToken: authToken }).exec();
    const agency = await Agency.findOne({ owner: user._id });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (user.type !== "admin" && user.type !== "owner") {
      return res.status(403).json({ message: "Access forbidden" });
    }

    const guides = await Guide.find({ agency: agency }).populate("user").exec();

    const filteredGuides = guides.filter(guide => guide.user != null);

    res.status(200).json(filteredGuides);
  } catch (error) {
    res.status(500).json({ message: "Error processing request" });
  }
});


router.post("/activate", async function (req, res) {
  const password = req.body.password;
  const token = req.body.token;


  if (!token || token === null) {
    return res.status(400).json({ message: "Link Expired", status: "error" });
  }

  try {
    // Log the token from the user object in the database
    const user = await User.findOne({ resetPasswordToken: token }).exec();
    // console.log('Token from database:', user?.resetPasswordToken);


    if (!user) {
      return res
        .status(400)
        .json({ message: "Please Contact admin", status: "error" });
    }

    const userId = user._id;
    const hashedPassword = await bcrypt.hash(password, 10);
    const authToken = jwt.sign({ userId }, secretKey, { expiresIn: "90d" });

    if (password) {
      user.password = hashedPassword;
      user.authToken = authToken;
      user.resetPasswordToken = "";

      await user.save();

      return res.status(200).json({
        message: "Password Updated Successfully",
        status: "success",
        authToken,
        user: user,
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ message: "Error updating password", status: "error" });
  }
});

module.exports = router;
