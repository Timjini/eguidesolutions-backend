console.log('peer');
const ROOM_ID = window.location.pathname.replace('/', ''); // Extract the room ID from the URL
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
    const myAudio = document.createElement('audio');
    myAudio.srcObject = stream;
    myAudio.play();

    myPeer.on('call', call => {
        call.answer(stream);
        const peerAudio = document.createElement('audio');

        call.on('stream', userAudioStream => {
            peerAudio.srcObject = userAudioStream;
            peerAudio.play();
        });

        call.on('close', () => {
            peerAudio.remove();
        });
    });

    socket.on('user-connected', () => {
        const call = myPeer.call(undefined, stream); // Call without specifying a user ID
        const peerAudio = document.createElement('audio');

        call.on('stream', userAudioStream => {
            peerAudio.srcObject = userAudioStream;
            peerAudio.play();
        });

        call.on('close', () => {
            peerAudio.remove();
        });
    });

    socket.on('user-disconnected', () => {
        const call = myPeer.call(undefined, stream);

    });
});


const muteButton = document.getElementById('muteButton');
muteButton.addEventListener('click', () => {
    // Add logic to mute/unmute audio
});


myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});
