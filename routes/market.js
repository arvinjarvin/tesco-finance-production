const express = require('express');
const router = express.Router();
const {
  marketGetTickerDetails,
  marketGetTickerNews,
  marketGetTickerFinancials,
  marketGetTickerTrades,
} = require('../controllers/market');

router.route('/symbols/:ticker/company').get(marketGetTickerDetails);
router.route('/symbols/:ticker/news').get(marketGetTickerNews);
router.route('/symbols/:ticker/financials').get(marketGetTickerFinancials);
router.route('/symbols/:ticker/trades').get(marketGetTickerTrades);

module.exports = router;
