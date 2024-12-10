const mongoose = require('../db');

const UserType = {
  LISTENER: 'listener',
  GUIDE: 'guide',
  ADMIN: 'admin',
  OWNER: 'owner',
  AGENT: 'agent'
};

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  deviceId : { type: String, required: false },
  phone: { type: String, required: false },
  authToken: { type: String, required: true },
  resetPasswordToken: { type: String },
  type: { type: String, required: true, enum: Object.values(UserType), default: UserType.LISTENER },
  username: { type: String, required: false },
  status: { type: String, required: true , default: "offline"},
  name: { type: String, required: false },
  avatar: { type: String, required: false },
  isAgencyOwner: { type: Boolean, default: false }, 
  ownedAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' }, 
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});


const User = mongoose.model('User', userSchema);

module.exports = User;
