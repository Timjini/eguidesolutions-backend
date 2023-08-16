const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');
const { PeerServer } = require('peer'); // Import the PeerServer

app.use(cors());

const path = require('path'); // Add this line

app.set('views', path.join(__dirname, 'views')); // Update this line if necessary
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
       socket.join(roomId)
       socket.broadcast.to(roomId).emit('user-connected', userId);
    });
});


// const peerServer = PeerServer({ port: 5000, path: '/' });


server.listen(4000)