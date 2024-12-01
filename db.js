const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.MONGO_URI 

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = mongoose;
