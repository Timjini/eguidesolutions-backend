const UserProfile = require('../../models/UserProfile');
const User = require('../../models/Users');
const UserProfileSerializer = require('../../serializers/v2/userProfileSerializer');

async function getUserProfile(req, res) {
  try {
    const userProfile = await UserProfile.findOne({ id: req.params.id });
    const user = await User.findOne({ _id: userProfile.id });

    if (!userProfile || !user) {

        return res.status(404).json({ message: 'User profile not found' });
    }

    const serializedData = UserProfileSerializer.serialize(userProfile);

    const mergedData = {
      ...serializedData,
      avatar: user.avatar,
      phone: user.phone,
      email: user.email,
    };

    return res.status(200).json(mergedData);
  } catch (error) {

    return res.status(500).json({ message: 'Error fetching user profile', error });
  }
}


async function createUserProfile(req, res) {
  try {
    const userProfile = new UserProfile(req.body);
    await userProfile.save();

    return res.status(201).json(UserProfileSerializer.serialize(userProfile));
  } catch (error) {

    return res.status(400).json({ message: 'Error creating user profile', error });
  }
}


async function updateUserProfile(req, res) {
  try {
    const updatedUserProfile = await UserProfile.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!updatedUserProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.status(200).json(UserProfileSerializer.serialize(updatedUserProfile));
  } catch (error) {
    return res.status(400).json({ message: 'Error updating user profile', error });
  }
}


async function deleteUserProfile(req, res) {
  try {
    const userProfile = await UserProfile.findOneAndDelete({ id: req.params.id });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user profile', error });
  }
}

module.exports = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
