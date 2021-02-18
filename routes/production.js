const express = require('express');
const { developerGetServices } = require('../controllers/production');
const router = express.Router();

router.route('/services').get(developerGetServices);

module.exports = router;
