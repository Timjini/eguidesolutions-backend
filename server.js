const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index'); // Renders views/index.ejs
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received audio data:', message); // Log received audio data
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
});

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
