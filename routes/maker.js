const express = require('express');
const router = express.Router();
const makerController = require('../controllers/maker');
const multer = require('multer');
const upload = multer();
const isLoggedIn = require('../helpers/isLoggedIn');
const cleanCache = require('../helpers/cleanCache');

router.get('/new', isLoggedIn, makerController.newMaker);
router.post('/', upload.any(), isLoggedIn, cleanCache, makerController.createMaker);
router.get('/:slug/edit', isLoggedIn, cleanCache, makerController.editMaker);
router.put('/:slug', upload.any(), isLoggedIn, cleanCache, makerController.updateMaker);
router.delete('/:slug', isLoggedIn, cleanCache, makerController.deleteMaker);

module.exports = router;