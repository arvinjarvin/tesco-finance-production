const asyncHandler = require('../middleware/async');
const {
  polygonReferenceService,
  polygonRestService,
} = require('../util/polygonClient');

exports.querySearchTicker = asyncHandler(async (req, res, next) => {
  const { q, page } = req.query;
  const tickerResults = await polygonReferenceService.reference.tickers({
    sort: 'ticker',
    perpage: 7,
    search: q,
    page: page !== undefined ? parseInt(page) : 1,
  });
  res.status(200).json({
    success: true,
    data: tickerResults,
  });
});
