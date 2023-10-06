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
let stream; // Declare the stream variable in the global scope
let myPeerId; 

const generateRandomId = () => Math.floor(Math.random() * 1000) + 1;
const myPeer = new Peer(generateRandomId().toString(), {
    host: window.location.hostname,
    port: 5000,
    path: '/'
});
const peers = {}; // Store all connected peers
let isMuted = false; // Flag to track audio mute status

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(mediaStream => {
    stream = mediaStream; // Assign the media stream to the global stream variable

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

        // Store the call object in the peers dictionary
        peers[userId] = call;

        // When a new user's video stream is received, add it to the peerVideo element
        call.on('stream', userVideoStream => {
            addVideoStream(peerVideo, userVideoStream);
        });

        // When the call is closed, remove the corresponding video element
        call.on('close', () => {
            peerVideo.remove();
        });

        // Append the peerVideo element to the videoGrid div (or any other container you prefer)
        document.getElementById('videoGrid').append(peerVideo);
    }

    function addVideoStream(videoElement, stream) {
        videoElement.srcObject = stream;
        videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play();
        });
        document.body.append(videoElement);
    }

    myPeer.on('open', id => {
        myPeerId = id;
        socket.emit('join-room', ROOM_ID, myPeerId);
    });

    // Update user count when a user joins or leaves
    socket.on('user-count', (count) => {
        userCountElement.textContent = `Users connected: ${count}`;
        console.log("new user count: ");
    });
}).catch(error => {
    console.error('Error accessing media devices:', error);
});
