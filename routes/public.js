const express = require('express');
const { publicQueryTicker } = require('../controllers/public');
const router = express.Router();

router.route('/ticker').get(publicQueryTicker);

module.exports = router;
