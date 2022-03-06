const Storage = require('megajs');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
  };  

exports.storage = (req, res, next) => {
    const extension = MIME_TYPES[req.file.mimetype];
    const full_name = req.body.fname +'_'+ req.body.lname;
    const filename = full_name.split(' ').join('_').toLowerCase();
    (async () => {
        const storage = await new Storage({
            email: 'elielmungo9@gmail.com',
            password: 'Dexter512',
            keepalive: false
          }).ready
          
          storage.upload({name: filename + '.' + extension, allowUploadBuffering: true}, req.file.buffer, (error, uploadedFile) => {
              if(error){
                  console.log(error);
                  res.render('error', { status: 500, message: 'Une erreur est survenue, veuillez réesayer S\'il vous plaît' });
              }
              let url;
              (async () => {
                  url = await uploadedFile.link({ key: 'UKnhmFtgkKKPnRWZhN8nkBaYyF3hHytPk0wrYd1Es2w' })
                  res.locals.link = url;
                  next();
                }
              )();
          })
    })();
};