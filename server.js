const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const cors = require('cors');
// const { v4: uuidV4 } = require('uuid');
const verifyToken = require("./auth/authMiddleware");
const usersRoutes = require('./api/users/usersRoutes');
const channelsRoutes = require('./api/channels/channelsRoutes');
const agenciesRoutes = require('./api/agencies/agenciesRoutes');
const toursRoutes = require('./api/tours/toursRoutes');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const path = require('path');
const { upload, uploadToS3 } = require('./fileUploader');




// =================================================================================================
// ======================================== R2 BUCKET =============================================[]
// =================================================================================================

app.post('/upload', async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error uploading file:', err);
        return res.status(500).json({ error: 'Error uploading file.' });
      }

      const file = req.file;
      const result = await uploadToS3(file);

      res.json(result);
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Error uploading file.' });
  }
});
// =================================================================================================
// =========================================== ROUTES =============================================[]
// =================================================================================================

  
const allowedOrigins = ['https://admin-eguide.vercel.app', 'https://admin.e-guidesolutions.com', 'http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins
}));

app.use(upload);

app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/agencies', agenciesRoutes);


// =================================================================================================
// ========================================= GENERATE TOKEN ======================================[]
// =================================================================================================


// Agora Token Generator
app.get('/token', (req, res) => {
  const appId = process.env.APP_KEY;
  const appCertificate = process.env.APP_CERTIFICATE;

  const channelName = req.query.channelName || 'demoChannel';
  const uid = req.query.uid || 0;
  const role = RtcRole.PUBLISHER;

  const expirationTimeInSeconds = 3600;

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const key = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  res.json({ key });
});




server.listen(4000)