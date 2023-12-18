const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_BUCKET_SECRET_KEY,
  region: process.env.AWS_BUCKET_REGION,
  // endpoint: process.env.S3_API_ENDPOINT,
  s3ForcePathStyle: true,
});

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

const uploadToS3 = async (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const uniqueFilename = uniqueSuffix + extension;

  const params = {
    Bucket: process.env.NEW_BUCKET_NAME,
    Key: uniqueFilename,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();
  console.log('File uploaded successfully. ETag:', data.ETag);

  return { originalname: file.originalname, file_name: uniqueFilename };
  
};

const getObjectFromS3 = async (fileName) => {
  const params = {
    Bucket: process.env.NEW_BUCKET_NAME,
    Key: fileName,
  };

  return await s3.getObject(params).promise();
};


const getUserAvatarUrl = (user) => {
  return user.avatar
    ? `uploads/${user.avatar}`
    : 'uploads/user.png'; 
};



module.exports = { upload, uploadToS3 , getObjectFromS3,getUserAvatarUrl };
