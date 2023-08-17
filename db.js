const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:9T69hsFlCpri4pNu@eguide-db.mtcke3w.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = mongoose;
