const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

// Configure the AWS SDK with your credentials and endpoint
const s3 = new AWS.S3({
  accessKeyId: 'bc6884a13fd21a529605b6c7a8c4b454',
  secretAccessKey: '1a2f0d62affcb1350bc56935850903af9663887f201808fca8e5761f27558202',
  endpoint: 'https://28afba52e7402b82150c6d7186091120.r2.cloudflarestorage.com',
  s3ForcePathStyle: true, // Required for R2 Cloudflare Storage
});

// Define the bucket name
const bucketName = 'eguide';

// Set up multer-s3 to handle the file upload to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    acl: 'public-read', // Set the appropriate ACL for your use case
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
}).single('upload');

module.exports = {
  s3,
  bucketName,
  upload,
};
