require('dotenv').config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;
const User = require("../models/Users");

// const verifyToken = (req, res, next) => {
//   const token =
//     req.body.token || req.query.token || req.headers.authorization

//   if (!token) {
//     return res.status(403).send("A token is required for authentication");
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     req.user = decoded;
//     next(); // Call next to continue to the next middleware or endpoint handler
//   } catch (err) {
//     console.error('Invalid token:', err.message);
//     console.error(err.stack);
//     return res.status(401).send("Invalid Token");
//   }
// };

const isAgencyOwner = async (req, res, next) => {
  try {
      const authToken = req.headers.authorization?.split(' ')[1];
      const user = await User.findOne({ authToken: authToken });

      if (user && user.isAgencyOwner) {
          req.user = user; // Add the user to the request object for later use
          next();
      } else {
          res.status(401).json({ message: 'Unauthorized: Only agency owners can perform this action' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const isAdministrator = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization?.split(' ')[1];
    
    const user = await User.findOne({authToken: authToken});
        if (user && user.type == "admin"){
          req.user = user;
          next();
        } else {
          res.status(401).json({message: 'Unauthorized: Only admin can perform this action'});
        } 
    }catch (error){
      console.log(error);
      res.status(500).json({message: 'Something wrong with Admin on auth.js'})
    }
};


module.exports = {
  isAgencyOwner,
  isAdministrator,
};
