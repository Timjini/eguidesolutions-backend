const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');
const { PeerServer } = require('peer'); // Import the PeerServer
const bodyParser = require('body-parser');
const crypto = require('crypto');
const uuid = require('uuid'); // Import the UUID library
const authenticationMiddleware = require('./auth/authenticationMiddleware'); // Adjust the path accordingly

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/Users'); 

const secretKey = crypto.randomBytes(32).toString('hex');
console.log(secretKey);

app.use(cors());

const path = require('path'); // Add this line

app.set('views', path.join(__dirname, 'views')); // Update this line if necessary
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

app.post('/register', async (req, res) => {
    const id = uuid.v4();
    const { email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid.v4(); // Generate a unique user ID
    const authToken = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });

    console.log(req.body);
  
    try {
      const user = new User({
        id,
        email,
        password: hashedPassword,
        phone,
        authToken,
      });
  
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while registering user' });  
      console.log(error);
    }
});
  
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user.id }, 'secretKey', { expiresIn: '365days' });
      res.json({ token , userId: user.id });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while logging in' });
    }
  });

io.use(authenticationMiddleware);
io.on('connection', async socket => {
    const authToken = socket.handshake.query.authToken;
  
    try {
      const user = await User.findOne({ authToken }); // Assuming you have a User model
  
      if (!user) {
        return; // User not found or authToken is invalid
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