const mongoose = require('../db');

// Define the schema
const userProfileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  country: { type: String, required: false },
  city: { type: String, required: false },
  address: { type: String, required: false },
  coordinates: {
    lng: { type: Number },
    lat: { type: Number },
  },
  dob: { type: Date, required: false },
  department: { type: String, required: false },
  selectedLanguage: { type: String, required: false },
  timeZone: { type: String, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create the model using the correct schema name
const UserProfile = mongoose.model('User', userProfileSchema);

module.exports = UserProfile;
