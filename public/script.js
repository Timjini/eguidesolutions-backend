
const socket = io('/');

const myPeer = new Peer(undefined, {
    host: window.location.hostname,
    port: 5000, // Use the port where your PeerJS server is running
    path: '/' // Use the path where your PeerJS server is running
});




// Define the connectToNewUser function
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const audio = document.createElement('audio');
    
    call.on('stream', userAudioStream => {
        audio.srcObject = userAudioStream;
        audio.play();
    });

    call.on('close', () => {
        audio.remove();
    });

    peers[userId] = call;
}

// Initialize the peers object
const peers = {}; // Create an empty object to store the WebRTC connections

// Rest of your code
const myAudio = document.createElement('audio');
myAudio.muted = true;

let isMuted = false; // Track mute state

navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
}).then(stream => {
    myAudio.srcObject = stream;

    myPeer.on('call', call => {
        call.answer(stream);
        const audio = document.createElement('audio');
        call.on('stream', userAudioStream => {
            audio.srcObject = userAudioStream;
            audio.play();
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    // Toggle mute state when the mute button is clicked
    const muteButton = document.getElementById('muteButton');
    muteButton.addEventListener('click', () => {
        myAudio.muted = true;
        console.log('Mute state: ' + isMuted);
    });
});

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

socket.on('user-connected', userId => {
    console.log('user connected: ' + userId);
});



