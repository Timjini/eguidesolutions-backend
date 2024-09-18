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
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add a unique index on the `user` field to ensure a user can only have one profile
userProfileSchema.index({ user: 1 }, { unique: true });

// Pre-save middleware to update `updatedAt` on document update
userProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model using the schema
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
