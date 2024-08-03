const express = require('express');
const router = express.Router();
const controllerDatabase = require('../Controllers/databaseConnectionController');

router.post('/verify', controllerDatabase.verify);



module.exports = router;