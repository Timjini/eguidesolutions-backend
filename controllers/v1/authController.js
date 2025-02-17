const sendWelcomeEmail = require("../../mailer/welcomeUser");
const User = require("../../models/Users");
const authSerializer = require("../../serializers/authSerializer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const {
  generateRandomPassword,
  generateUserCredentials,
} = require("../../utils/auth/checkUser");
const secretKey = process.env.JWT_SECRET_KEY;
const sendPasswordResetEmail = require("../../mailer/sendPasswordResetEmail");

async function loginAuth(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Update the user's status to "online" in the database
    await User.updateOne({ _id: user._id }, { $set: { status: "online" } });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: authSerializer.serialize(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function signUpAuth(req, res) {
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

  try {
    const user = new User({
      id,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      type,
      authToken,
      username,
      name,
      avatar: imageName ?? "",
    });

    await user.save();
    res
      .status(201)
      .json({
        message: "User registered successfully",
        authToken,
        user: authSerializer.serialize(user),
      });

    await sendWelcomeEmail(user);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while registering user" });
  }
}

async function guestUser(req, res) {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        status: "error",
        message: "Device ID is required",
      });
    }

    const user = await User.findOne({ deviceId });

    if (!user) {
      const id = uuid.v4();
      const userId = uuid.v4();
      const authToken = jwt.sign({ userId }, secretKey, { expiresIn: "90d" });
      const { username, email } = generateUserCredentials();
      const password = generateRandomPassword();

      const newUser = new User({
        id,
        email,
        userId,
        password,
        username,
        name: username,
        deviceId,
        authToken,
        status: "online",
      });

      await newUser.save();
      return res.status(201).json({
        status: "success",
        message: "Guest user created successfully",
        authToken,
        user: authSerializer.serialize(newUser),
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "User already exists",
        authToken: user.authToken,
        user: authSerializer.serialize(user),
      });
    }
  } catch (error) {
    console.error("Error in guestUser:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request",
    });
  }
}

async function logoutAuth(req, res) {
  try {
    const user = await User.findOne({ _id: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's status to "offline" in the database
    await User.updateOne({ _id: user._id }, { $set: { status: "offline" } });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteAccount(req, res) {
  try {
    const authToken = req.headers.authorization?.split(" ")[1];
    const user = await User.findOne({ authToken: authToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // delete User
    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
      status: "success",
      message: "Account Deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// password actions

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiration = resetTokenExpiration;
    await user.save();
    console.log("user", user);

    try {
      await sendPasswordResetEmail(user);
    } catch (error) {
      console.log("error", error);
    }

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiration: { $gt: Date.now() },
    });

    console.log("Before update:", user._id);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiration = undefined;
    await user.save();

    console.log("After update:", user._id);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while resetting your password" });
  }
}

module.exports = {
  loginAuth,
  logoutAuth,
  signUpAuth,
  deleteAccount,
  guestUser,
  forgotPassword,
  resetPassword,
};
