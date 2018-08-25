const express = require('express');
const router = express.Router();
const makerController = require('../controllers/maker');
const multer = require('multer');
const upload = multer();
const isLoggedIn = require('../helpers/isLoggedIn');

router.get('/new', isLoggedIn, makerController.newMaker);
router.post('/', upload.any(), isLoggedIn, makerController.createMaker);
router.get('/:slug/edit', isLoggedIn, makerController.editMaker);
router.put('/:slug', isLoggedIn, makerController.updateMaker);
router.delete('/:slug', isLoggedIn, makerController.deleteMaker);

module.exports = router;