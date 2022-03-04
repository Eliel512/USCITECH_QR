const multer = require('multer');
//const mime = require('mime-types');
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const path = "public/files/";
    callback(null, path);
  },
  filename: (req, file, callback) => {
    const full_name = req.body.fname +'_'+ req.body.lname;
    const filename = full_name.split(' ').join('_').toLowerCase();
    const extension = MIME_TYPES[file.mimetype];
    if(!extension){
      throw 'Invalid file type';
    }
    /* + '.' + extension*/
    callback(null, filename + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('file');