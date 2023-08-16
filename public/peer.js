console.log('Initializing PeerJS Server...');
const { PeerServer } = require('peer');
const server = PeerServer({ port: 5000 });
console.log('Peer server running on port 5000');
module.exports = server;
