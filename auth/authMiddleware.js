require('dotenv').config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.TOKEN_KEY;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers.authorization?.split(' ')[1];
    console.log(req.headers);

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Invalid token:', err.message);
    return res.status(401).send("Invalid Token");
  }
};

module.exports = verifyToken;
