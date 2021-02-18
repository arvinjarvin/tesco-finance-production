const express = require('express');
const { querySearchTicker } = require('../controllers/query');
const router = express.Router();

router.route('/tickers').get(querySearchTicker);

module.exports = router;
