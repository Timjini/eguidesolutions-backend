const mongoose = require('../db');

// Define the schema
const userProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  phone: { type: String },
  dob: { type: Date },
  department: { type: String },
  selectedLanguage: { type: String },
  timeZone: { type: String },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create the model using the schema
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
