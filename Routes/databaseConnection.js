const express = require('express');
const router = express.Router();
const controllerDatabase = require('../Controllers/databaseConnectionController');

router.post('/verify', controllerDatabase.verify);
router.post('/filmCheckList', controllerDatabase.filmCheckList);
router.post('/addFilm', controllerDatabase.addFilm);
router.post('/removeFilm', controllerDatabase.removeFilm);




module.exports = router;