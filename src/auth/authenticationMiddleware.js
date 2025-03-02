require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const secretKey = process.env.JWT_SECRET_KEY;

const authenticationMiddleware = async (socket, next) => {
  const authToken = socket.handshake.query.authToken;

  if (!authToken) {
    return next(new Error('Authentication failed. No authToken provided.'));
  }

  try {
    const decoded = jwt.verify(authToken, secretKey);
    const userId = decoded.userId;

    const user = await User.findOne({ userId });

    if (!user) {
      return next(new Error('Authentication failed. User not found.'));
    }

    socket.user = user;
    next();
  } catch (error) {
    return next(new Error('Authentication failed. Invalid authToken.'));
  }
};

module.exports = authenticationMiddleware;
