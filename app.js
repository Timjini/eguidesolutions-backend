// app.js (client-side JavaScript)

const socket = io();

const startButton = document.getElementById('startButton');
let localStream;

startButton.addEventListener('click', async () => {
    try {
        // Get local audio stream
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Local stream:', localStream);

        // Mute the local audio track
        localStream.getAudioTracks().forEach(track => {
            track.enabled = false;
        });

        // Initialize RTCPeerConnection
        const peerConnection = new RTCPeerConnection();

        // Add the local audio stream to the peer connection
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Create an offer and set it as the local description
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send the offer to the server
        socket.emit('offer', offer);

        // Handle incoming offers from other clients
        socket.on('offer', async (offer) => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Create an answer and set it as the local description
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            // Send the answer to the server
            socket.emit('answer', answer);
        });

        // Handle incoming answers from other clients
        socket.on('answer', async (answer) => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // Handle incoming ICE candidates from other clients
        socket.on('ice-candidate', async (candidate) => {
            try {
                await peerConnection.addIceCandidate(candidate);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        });

        console.log('WebRTC connection established.');
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
});
