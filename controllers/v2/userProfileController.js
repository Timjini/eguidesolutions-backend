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

async function createNewAddress(address){
  const addressManipulated = await addressPayload(address);
  const newAddressCreation = await createAddress(addressManipulated);
  return newAddressCreation;
}

async function createOrUpdateUserProfile(req, res) {
  try {
    const authToken = req.headers.authorization?.split(' ')[1];
    const { dob, department, selectedLanguage, timeZone, phoneNumber } = req.body;

    const user = await User.findOne({ authToken: authToken });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userProfile = await UserProfile.findOne({ user: user._id });
    
    const userAddress = await Address.findOne({ _id: userProfile?.address });
    if (!userAddress && req.body.address) {
      userAddress = await createNewAddress(req.body.address);
    } else {
      return res.status(400).json({ message: 'Address is required' });
    }
    
    if (!userProfile) {
      userProfile = new UserProfile({
        email: user.email,
        user: user._id,
        phone: phoneNumber,
        address: userAddress._id,
        dob,
        department,
        selectedLanguage,
      });
    } else {
      userProfile.address = userAddress._id;
      userProfile.phone = phoneNumber;
      userProfile.dob = dob;
      userProfile.department = department;
      userProfile.selectedLanguage = selectedLanguage;
    }

    await userProfile.save();
    return res.status(200).json({message:'success', user_profile: userProfile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
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
