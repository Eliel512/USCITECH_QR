const express = require('express');
const router = express.Router();

const appCtrl = require('../controllers/app.js');
const multer = require('../middleware/multer');
const { storage } = require('../middleware/storage.js');

router.get('/', appCtrl.home);
router.get('/signup', appCtrl.getForm);
router.get('/table/:status', appCtrl.table);
router.post('/signup', multer, storage, appCtrl.postForm);
router.post('/generate', appCtrl.generate);
router.post('/regenerate', appCtrl.regenerate);
router.get('/:user_id', appCtrl.ticket);

module.exports = router;