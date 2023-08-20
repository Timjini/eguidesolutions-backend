const jwt = require("jsonwebtoken");
const secretKey = "f5a2d3689d92485dc11c43d788dd84b3e238e1a59b72d410e0b7dff3b57ea2ab";

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers.authorization

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next(); // Call next to continue to the next middleware or endpoint handler
  } catch (err) {
    console.error('Invalid token:', err.message);
    console.error(err.stack);
    return res.status(401).send("Invalid Token");
  }
};

module.exports = verifyToken;
