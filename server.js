const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
// const { v4: uuidV4 } = require('uuid');
const verifyToken = require("./auth/authMiddleware");
const usersRoutes = require("./api/users/usersRoutes");
const channelsRoutes = require("./api/channels/channelsRoutes");
const agenciesRoutes = require("./api/agencies/agenciesRoutes");
const toursRoutes = require("./api/v1/tours/touristToursRoutes");
const adminRoutes = require("./api/admin/adminRoutes");
const touristToursRoutes = require("./api/v1/tours/touristToursRoutes");
const authRoutes = require("./api/v1/auth/authRoutes");
const favoriteRoutes = require("./api/v1/favorite/favoriteRoutes");
const touristChannelRoutes = require("./api/v1/channels/touristChannelsRoutes");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const path = require("path");
const { upload, uploadToS3, getObjectFromS3 } = require("./fileUploader");
const userProfileRoutesAdminPanel = require("./api/v2/userProfileRoutes");

// =================================================================================================
// ========================================CORS POLICY =============================================[]
// =================================================================================================

const allowedOrigins = [
  "https://admin-eguide.vercel.app",
  "https://admin.e-guidesolutions.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

// =================================================================================================
// ======================================== R2 BUCKET / FILE UPLOADS ==============================[]
// =================================================================================================

app.post("/upload", async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: "Error uploading file." });
      }

      const file = req.file;
      const result = await uploadToS3(file);

      res.json(result);
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Error uploading file." });
  }
});
// =================================================================================================
// =========================================== APP's ROUTES =======================================[]
// =================================================================================================

app.use(upload);

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(express.json());

// Use these Routes for Agency users (Owner, Guide, Agent) and Travelers
app.use("/api/users", usersRoutes);
app.use("/api/channels", channelsRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/agencies", agenciesRoutes);

// Mobile Client routes
app.use("/api/v1/auth", authRoutes);
// app.use('api/v1/channels', touristChannelsRoutes);
app.use("/api/v1/tours", touristToursRoutes);
app.use("/api/v1/favorite", favoriteRoutes);
app.use("/api/v1/channels", touristChannelRoutes);

// Use This for Admin user (administrator) requests
app.use("/api/admin", adminRoutes);

app.get("/uploads/:file_name", async (req, res) => {
  try {
    const fileName = req.params.file_name;
    const data = await getObjectFromS3(fileName);

    res.writeHead(200, { "Content-Type": data.ContentType });
    res.end(data.Body);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// =================================================================================================
// =========================================== Admin's ROUTES =======================================[]
// =================================================================================================

//userProfile Page Routes : /profile
app.use("/api/v2/user-profile", userProfileRoutesAdminPanel);


// =================================================================================================
// =================================== AGORA CHANNEL GENERATE TOKEN ===============================[]
// =================================================================================================

// Agora Token Generator
app.get("/token", (req, res) => {
  const appId = process.env.APP_KEY;
  const appCertificate = process.env.APP_CERTIFICATE;

  const channelName = req.query.channelName || "demoChannel";
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

server.listen(4000);
