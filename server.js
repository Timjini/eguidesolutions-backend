const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the public directory
app.use(express.static('views'));

// Add a middleware to set the Content Security Policy header
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self' https://vercel.live");
    next();
  });

app.get('/', (req, res) => {
    res.render('index.html', {title : 'Welcome to Vercel Application Server'});
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    // Broadcast received audio data to all connected clients except the sender
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
