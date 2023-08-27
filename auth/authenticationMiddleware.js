const jwt = require('jsonwebtoken');
const User = require('../models/Users'); // Adjust the path accordingly
const secretKey = "f5a2d3689d92485dc11c43d788dd84b3e238e1a59b72d410e0b7dff3b57ea2ab"

const authenticationMiddleware = async (socket, next) => {
  const authToken = socket.handshake.query.authToken;

  if (!authToken) {
    return next(new Error('Authentication failed. No authToken provided.'));
  }

  try {
    const decoded = jwt.verify(authToken, secretKey);
    console.log(secretKey + "secretKey")
    const userId = decoded.userId;

    const user = await User.findOne({ userId });

    if (!user) {
      return next(new Error('Authentication failed. User not found.'));
    }

    // Attach user object to socket for further use
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error('Authentication failed. Invalid authToken.'));
  }
};

module.exports = authenticationMiddleware;
