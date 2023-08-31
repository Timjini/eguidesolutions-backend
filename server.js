const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');
const { PeerServer } = require('peer'); // Import the PeerServer
const crypto = require('crypto');
const uuid = require('uuid'); // Import the UUID library
const verifyToken = require("./auth/authMiddleware");
const Room = require('./models/Rooms');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/Users'); 
const usersRoutes = require('./api/users/usersRoutes'); // Import your route files

// const secretKey = crypto.randomBytes(32).toString('hex');

const path = require('path'); // Add this line
const { error } = require('console');

const storage = multer.diskStorage({
  destination: path.join(__dirname, './public/uploads'),
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    callback(null, uniqueSuffix + extension);
  },
});

  
const upload = multer({ storage });
  
const allowedOrigins = ['https://admin-eguide.vercel.app', 'http://localhost:5000'];
app.use(cors(
  {
    origin: allowedOrigins,
    credentials: true
  }
));
app.set('views', path.join(__dirname, 'views')); // Update this line if necessary
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use('/api/users', usersRoutes);

app.post("/welcome", verifyToken, (req, res) => {
  res.json({ message: 'You have access to this secure route!', user: req.user });
});




// io.use(authenticationMiddleware);
io.on('connection', async socket => {
    const authToken = socket.handshake.query.authToken;
  
    try {
      const user = await User.findOne({ authToken }); 
  
      if (!user) {
        return; 
      }
  
      // You can now access the user's properties, including user.email
      console.log('User connected:', user.email);
  
      socket.on('join-room', (roomId, userId) => {
        console.log('Room joined:', roomId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
      });
  
      // Other socket event handlers here
  
    } catch (error) {
      // Handle any potential errors
      console.error('Error while handling socket connection:', error);
    }
  });
  


// const peerServer = PeerServer({ port: 5000, path: '/' });


server.listen(4000)