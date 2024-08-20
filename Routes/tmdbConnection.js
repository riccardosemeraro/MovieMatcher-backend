const express = require('express');
const router = express.Router();
const controllerTmdb = require('../Controllers/tmdbConnectionController');

router.get('/movieSlider', controllerTmdb.movieSlider);
router.get('/filmPage/:id', controllerTmdb.filmPage);
router.get('/search', controllerTmdb.search);






module.exports = router;