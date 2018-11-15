const path = require('path');

// File handler
const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME type');
    if (isValid) {
      error = null;
    }
    // For PRODUCTION, this env variable removes backend/
    callback(error, process.env.MULTER_PATH ? `${process.env.MULTER_PATH}images` : 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-'); // Replace space with dash
    const extension = MIME_TYPE_MAP[file.mimetype];
    callback(null, `${name}-${Date.now()}.${extension}`); // Build unique filename
  }
});

module.exports = multer({ storage }).single('image');
