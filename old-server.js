const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');
const { PeerServer } = require('peer'); // Import the PeerServer
const crypto = require('crypto');
const verifyToken = require("./auth/authMiddleware");
const Room = require('./models/Channels');
const multer = require('multer');
const User = require('./models/Users'); 
const usersRoutes = require('./api/users/usersRoutes');
const channelsRoutes = require('./api/channels/channelsRoutes');
const agenciesRoutes = require('./api/agencies/agenciesRoutes');
const toursRoutes = require('./api/tours/toursRoutes');


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
  
const allowedOrigins = ['https://admin-eguide.vercel.app', 'https://admin.e-guidesolutions.com', 'http://localhost:5173', 'http://localhost:3000'];


app.use(cors({
  origin: allowedOrigins
}));

app.set('views', path.join(__dirname, 'views')); // Update this line if necessary
// app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.use(express.json());

// app.use(express.static('public')); 
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// app.use(express.json());

// app.use(verifyToken); 
app.use('/api/users', usersRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/agencies', agenciesRoutes);

app.post("/welcome", verifyToken, (req, res) => {
  res.json({ message: 'You have access to this secure route!', user: req.user });
});


app.get('/' , (req, res) => { 
  res.redirect(`/${uuidV4()}`)
});

app.get('/:room', (req,res)=>{
  res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (room && room.size > 1) {
      // Room exists and has at least 2 clients (including the current client)
      socket.join(roomId);
      socket.to(roomId).broadcast.emit('user-connected', userId);
    } else {
      // Room doesn't exist or has only one client, create the room
      socket.join(roomId);
      socket.emit('room-created', roomId);
    }

    socket.on('disconnect', () => {
      // Handle user disconnection if needed
    });
  });
});




// const peerServer = PeerServer({ port: 5000, path: '/' });


server.listen(4000)