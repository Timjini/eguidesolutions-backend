const UserProfile = require('../../models/UserProfile');
const User = require('../../models/Users');
const UserProfileSerializer = require('../../serializers/v2/userProfileSerializer');
const UserSerializer = require('../../serializers/v2/userSerializer');
const { createAddress, addressPayload } = require("../../helpers/TourHelper");


async function getUserProfile(req, res) {

  try {
    // solution 1 : authToken , find user using the auth token
    const authToken = req.headers.authorization?.split(' ')[1];
    const user = await User.findOne({ authToken: authToken });
    const userProfile = await UserProfile.findOne({ id: user.id });

    let serializedData = [];
    if (userProfile) {
      serializedData = UserProfileSerializer.serialize(userProfile);
    }
    const serializedUser = UserSerializer.serialize(user);

    if (serializedData) {
      userData = { ...serializedUser, ...serializedData };
    }

    return res.status(200).json(userData);
  } catch (error) {

    return res.status(500).json({ message: 'Error fetching user profile', error });
  }
}


async function createOrUpdateUserProfile(req, res) {
  try {
    // Extract and split the auth token
    const authToken = req.headers.authorization?.split(' ')[1];
    const user = await User.findOne({ authToken: authToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let userProfile = await UserProfile.findOne({ id: user._id });

    if (!userProfile) {
      const addressData = req.body.address;
      const addressManipulated = await addressPayload(addressData)
      const address = await createAddress(addressManipulated);

      userProfile = new UserProfile({
        ...req.body,
        address: address._id,
        user: user._id
      });
      await userProfile.save();
      return res.status(201).json(UserProfileSerializer(userProfile));
    } else {
      userProfile = await UserProfile.findOneAndUpdate(
        { id: user._id },
        req.body,
        { new: true }
      );
    }

    return res.status(201).json(UserProfileSerializer.serialize(userProfile));

  } catch (error) {
    return res.status(400).json({ message: 'Error creating or updating user profile', error });
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
  createOrUpdateUserProfile,
  deleteUserProfile,
};
