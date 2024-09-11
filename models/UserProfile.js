const mongoose = require('../db');


const userProfileSchema = new mongoose.Schema({
  id: {type: {String}, required: true, unique: true },
  country: {String},
  city: {String},
  address: {String},
  lng: Number,
  lat: Number,
  dob: Date,
  department: {String},
  selectedLanguage: {String},
  timeZone: {String},
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});


const User = mongoose.model('User', userSchema);

module.exports = User;
