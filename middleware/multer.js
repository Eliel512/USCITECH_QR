const multer = require('multer');
//const mime = require('mime-types');

const upload = multer();

module.exports = upload.single('file');