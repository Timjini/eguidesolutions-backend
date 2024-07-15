const sendWelcomeEmail = require("../mailer/welcomeUser");
const User = require("../models/Users");
const authSerializer = require("../serializers/authSerializer");
const bcrypt = require("bcrypt");

async function loginAuth(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    console.log("login User:", user);
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
      email,
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
      .json({ message: "User registered successfully", authToken });

    await sendWelcomeEmail(user);

    console.log(user);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while registering user" });
    console.log(error);
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

module.exports = {
  loginAuth,
  logoutAuth,
  signUpAuth,
};
