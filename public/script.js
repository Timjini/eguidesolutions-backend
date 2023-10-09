
// const socket = io('/');

// var peer = new Peer();


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

socket.on('user-connected', userId => {
  console.log('User connected: ' + userId);
});
