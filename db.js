const mongoose = require('mongoose');

// MongoDB Configuration (Environment Variables)
const dbHost = 'mongodb_container';
const dbPort = '27017';
const dbUser = 'root';
const dbPassword = 'pass';
const dbName = 'eguide_db';

// MongoDB connection string
const connectionString = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: dbName, 
  serverSelectionTimeoutMS: 30000,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = mongoose;
