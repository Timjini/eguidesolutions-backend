const UserProfile = require('../../models/UserProfile');
const User = require('../../models/Users');
const UserProfileSerializer = require('../../serializers/v2/userProfileSerializer');
const UserSerializer = require('../../serializers/v2/userSerializer');
const { createAddress, addressPayload } = require("../../helpers/TourHelper");
const Address = require('../../models/Address');


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
    const authToken = req.headers.authorization?.split(' ')[1];
    const user = await User.findOne({ authToken: authToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userProfile = await UserProfile.findOne({ user: user._id });
    console.log("OUT !userProfile", userProfile)

    const addressData = req.body.address;
    const addressManipulated = await addressPayload(addressData);
    const address = await createAddress(addressManipulated);
    console.log("ADDRESS", address)

    if (!userProfile) {
      console.log("IN !userProfile")

      userProfile = new UserProfile({
        ...req.body,
        address: address._id,
        user: user._id
      });

      // Log for validation errors
      const validationError = userProfile.validateSync();
      if (validationError) {
        console.log("Validation Error:", validationError);
        return res.status(400).json({ message: 'Validation failed', error: validationError });
      }

      console.log("USER PROFILE CREATED ===>", userProfile);

      await userProfile.save();
      return res.status(201).json(UserProfileSerializer.serialize(userProfile));
    } else {
      // Update user profile
      console.log("Else !userProfile", userProfile)
      userProfile = await UserProfile.findOneAndUpdate(
        { user: user._id },
        // req.body,
        {
          email: req.body.email,
          department: req.body.department,
          address: address._id,
        },
        { new: true }
      );

      console.log("USER PROFILE UPDATED ===>", userProfile);

      return res.status(201).json(UserProfileSerializer.serialize(userProfile));
    }
  } catch (error) {
    console.error("Error:", error);
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
