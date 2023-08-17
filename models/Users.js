const mongoose = require('../db');

const UserType = {
  LISTENER: 'listener',
  SPEAKER: 'speaker',
  ADMIN: 'admin',
};

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: false },
  authToken: { type: String, required: true },
  type: { type: String, required: true, enum: Object.values(UserType), default: UserType.LISTENER },
  status: { type: String, required: true , default: "offline"},
  name: { type: String, required: false },
});


const User = mongoose.model('User', userSchema);

module.exports = User;
