console.log('peer');
const ROOM_ID = window.location.pathname.replace('/', ''); // Extract the room ID from the URL
const socket = io('/');

const myPeer = new Peer(undefined, {
    host: window.location.hostname,
    port: 5000,
    path: '/'
});

const peers = {}; // Store all connected peers
let isMuted = false; // Flag to track audio mute status

navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
}).then(stream => {
    const userCountElement = document.getElementById('userCount'); // Element to display user count

    const muteButton = document.getElementById('muteButton');
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        stream.getAudioTracks()[0].enabled = !isMuted;
    });

    myPeer.on('call', call => {
        call.answer(stream);

        const peerAudio = document.createElement('audio');
        peerAudio.srcObject = call.remoteStream; // Use the remote stream from the call
        peerAudio.play();

        call.on('close', () => {
            peerAudio.remove();
        });
    });

    socket.on('user-connected', userId => {
        const call = myPeer.call(userId, stream);

        const peerAudio = document.createElement('audio');
        call.on('stream', userAudioStream => {
            peerAudio.srcObject = userAudioStream;
            peerAudio.play();
        });

        call.on('close', () => {
            peerAudio.remove();
        });
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close();
            delete peers[userId];
        }
    });

    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id);
    });

    // Update user count when a user joins or leaves
    socket.on('user-count', (count) => {
        userCountElement.textContent = `Users connected: ${count}`;
        console.log("new user count: ");
    });
});
