console.log('peer');
const ROOM_ID = window.location.pathname.replace('/', '');
const socket = io('/');

const myPeer = new Peer(undefined, {
    host: window.location.hostname,
    port: 5000,
    path: '/'
});

const peers = {}; // Store all connected peers

navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
}).then(stream => {
    // Set up your own audio stream
    const myAudio = document.createElement('audio');
    myAudio.srcObject = stream;
    myAudio.play();

    // When you receive a connection from a new user
    myPeer.on('call', call => {
        call.answer(stream); // Answer the call with your stream
        const peerAudio = document.createElement('audio');

        // When the remote user's stream is available, play it
        call.on('stream', userAudioStream => {
            peerAudio.srcObject = userAudioStream;
            peerAudio.play();
        });

        // Handle the call being closed
        call.on('close', () => {
            peerAudio.remove();
        });
    });

    // When a new user connects, call them and send your stream
    socket.on('user-connected', userId => {
        const call = myPeer.call(userId, stream);
        const peerAudio = document.createElement('audio');

        // When the remote user's stream is available, play it
        call.on('stream', userAudioStream => {
            peerAudio.srcObject = userAudioStream;
            peerAudio.play();
        });

        // Handle the call being closed
        call.on('close', () => {
            peerAudio.remove();
        });

        // Store the call object in your peers list
        peers[userId] = call;
    });

    // When a user disconnects, close the call and remove their audio element
    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close();
            delete peers[userId];
        }
    });
});

myPeer.on('open', id => {
    // Emit the room ID and peer ID to the server for tracking
    socket.emit('join-room', ROOM_ID, id);
});
