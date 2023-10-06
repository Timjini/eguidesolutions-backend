// console.log('peer');
// const ROOM_ID = window.location.pathname.replace('/', ''); // Extract the room ID from the URL
// const socket = io('/');

// const myPeer = new Peer(undefined, {
//     host: window.location.hostname,
//     port: 5000,
//     path: '/'
// });

// const peers = {}; // Store all connected peers
// let isMuted = false; // Flag to track audio mute status

// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     const userCountElement = document.getElementById('userCount'); // Element to display user count

//     const muteButton = document.getElementById('muteButton');
//     muteButton.addEventListener('click', () => {
//         isMuted = !isMuted;
//         stream.getAudioTracks()[0].enabled = !isMuted;
//     });

//     myPeer.on('call', call => {
//         call.answer(stream);

//         const peerAudio = document.createElement('audio');
//         peerAudio.srcObject = call.remoteStream; // Use the remote stream from the call
//         peerAudio.play();

//         call.on('close', () => {
//             peerAudio.remove();
//         });
//     });

//     socket.on('user-connected', userId => {
//         const call = myPeer.call(userId, stream);

//         const peerAudio = document.createElement('audio');
//         call.on('stream', userAudioStream => {
//             peerAudio.srcObject = userAudioStream;
//             peerAudio.play();
//         });

//         call.on('close', () => {
//             peerAudio.remove();
//         });
//     });

//     socket.on('user-disconnected', userId => {
//         if (peers[userId]) {
//             peers[userId].close();
//             delete peers[userId];
//         }
//     });

//     myPeer.on('open', id => {
//         socket.emit('join-room', ROOM_ID, id);
//     });

//     // Update user count when a user joins or leaves
//     socket.on('user-count', (count) => {
//         userCountElement.textContent = `Users connected: ${count}`;
//         console.log("new user count: ");
//     });
// });


console.log('peer');
const ROOM_ID = window.location.pathname.replace('/', ''); // Extract the room ID from the URL
const socket = io('/');

const generateRandomId = () => Math.floor(Math.random() * 1000) + 1;
const myPeer = new Peer(generateRandomId().toString(), { // Convert the ID to string
    host: window.location.hostname,
    port: 5000,
    path: '/'
});

const peers = {}; // Store all connected peers
let isMuted = false; // Flag to track audio mute status

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    const userVideo = document.createElement('video'); // Element to display your own video
    userVideo.muted = true; // Mute your own video to prevent feedback
    addVideoStream(userVideo, stream); // Add your own video stream to the DOM

    // Handle incoming calls and streams from peers
    myPeer.on('call', call => {
        call.answer(stream); // Answer the call with your own stream
        const peerVideo = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(peerVideo, userVideoStream);
        });
    });
    

    // Handle user connections
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream); // Call the function to connect to a new user
    });

    // Handle user disconnections
    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close(); // Close the call to the disconnected user
            delete peers[userId]; // Remove the call object from the peers dictionary
        }
    });

    function connectToNewUser(userId, stream) {
        const call = myPeer.call(userId, stream);
        const peerVideo = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(peerVideo, userVideoStream); // Ensure userVideoStream is used here
        });
        call.on('close', () => {
            peerVideo.remove();
        });
        peers[userId] = call;
    }
    
    function addVideoStream(videoElement, stream) {
        videoElement.srcObject = stream;
        videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play();
        });
        document.body.append(videoElement);
    }

    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id);
    });

    // Update user count when a user joins or leaves
    socket.on('user-count', (count) => {
        userCountElement.textContent = `Users connected: ${count}`;
        console.log("new user count: ");
    });
});


console.log(stream.getTracks());

