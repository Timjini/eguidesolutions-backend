const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint: process.env.S3_API_ENDPOINT,
  s3ForcePathStyle: true,
});

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('upload');

const uploadToS3 = async (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const uniqueFilename = uniqueSuffix + extension;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: uniqueFilename,
    Body: file.buffer,
  };

  const data = await s3.upload(params).promise();
  console.log('File uploaded successfully. ETag:', data.ETag);

  return { originalname: file.originalname, file_name: uniqueFilename };
};

module.exports = { upload, uploadToS3 };
