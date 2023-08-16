// api/peer.js
const { PeerServer } = require('peer');
const server = PeerServer({ port: 5000 });

// PeerJS server logic here

module.exports = server;
