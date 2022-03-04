const express = require('express');
const router = express.Router();

const appCtrl = require('../controllers/app.js');
const multer = require('../middleware/multer');

router.get('/', appCtrl.home);
//router.get('/about', appCtrl.about);
router.get('/signup', appCtrl.getForm);
router.post('/signup', multer, appCtrl.postForm);
router.post('/generate', appCtrl.generate);
router.post('/regenerate', appCtrl.regenerate);
router.get('/:user_id', appCtrl.ticket);
//router.use('/filmotheque', filmothequeRoutes);
//router.use('/phototheque', photothequeRoutes);
//router.use('/frozen', frozenRoutes);

module.exports = router;