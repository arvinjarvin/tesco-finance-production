const asyncHandler = require('../middleware/async');
const axios = require('axios');
const {
  polygonReferenceService,
  polygonRestService,
} = require('../util/polygonClient');

exports.marketGetTickerDetails = asyncHandler(async (req, res, next) => {
  let { ticker } = req.params;
  const data = await polygonRestService.reference.tickerDetails(ticker);
  res.status(200).json({
    success: true,
    data,
  });
});

exports.marketGetTickerNews = asyncHandler(async (req, res, next) => {
  let { ticker } = req.params;
  const data = await polygonRestService.reference.tickerNews(ticker);
  res.status(200).json({
    success: true,
    data,
  });
});

exports.marketGetTickerFinancials = asyncHandler(async (req, res, next) => {
  let { ticker } = req.params;
  const data = await polygonRestService.reference.stockFinancials(ticker);
  res.status(200).json({
    success: true,
    data,
  });
});

exports.marketGetTickerTrades = asyncHandler(async (req, res, next) => {
  let { ticker } = req.params;
  const date = new Date();
  const todayDate = `${date.getFullYear().toString().padStart(2, '0')}-${(
    date.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
  const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48);
  const toDate = `${twoDaysAgo.getFullYear().toString().padStart(2, '0')}-${(
    twoDaysAgo.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${twoDaysAgo.getUTCDate().toString().padStart(2, '0')}`;
  // this was being trouble
  const data = await axios.get(
    `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/${toDate}/${todayDate}?apiKey=${process.env.POLYGON_API_KEY}`
  );
  res.status(200).json({
    success: true,
    data: data.data.results,
  });
});
