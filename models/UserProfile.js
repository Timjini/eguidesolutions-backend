const mongoose = require('../db');


// Define the schema
const userProfileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, required: false },
  phone: { type: String, required: false },
  dob: { type: Date, required: false },
  department: { type: String, required: false },
  selectedLanguage: { type: String, required: false },
  timeZone: { type: String, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  address:{type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true},
  user:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

// Create the model using the correct schema name
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;