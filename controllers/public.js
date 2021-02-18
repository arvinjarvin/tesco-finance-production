const { PUBLIC_FEED } = require('../constants');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../util/ErrorResponse');
const { polygonReferenceService } = require('../util/polygonClient');

exports.publicQueryTicker = asyncHandler(async (req, res, next) => {
  let { ticker } = req.query;
  if (!ticker) return next(new ErrorResponse('Please specify a ticker'));
  if (PUBLIC_FEED.indexOf(ticker) < 0)
    return next(
      new ErrorResponse('You are not authorized to access that stock!', 401)
    );
  let stock;
  try {
    stock = await polygonReferenceService.stocks.snapshotSingleTicker(ticker);
  } catch (ex) {
    stock = await polygonReferenceService.stocks.previousClose(ticker);
    return res.status(200).json({
      success: true,
      data: {
        ticker: ticker,
        lastQuote: {
          ask: 0,
          bid: 0,
        },
        lastTrade: {
          price: stock.results[0].c,
        },
        todaysChange: 0,
        todaysChangePerc: 0,
        closed: true,
      },
    });
  }
  res.status(200).json({
    success: true,
    data: {
      ticker: stock.ticker.ticker,
      lastQuote: {
        ask: stock.ticker.lastQuote.askPrice,
        bid: stock.ticker.lastQuote.bidPrice,
      },
      lastTrade: {
        price: stock.ticker.lastTrade.price,
      },
      todaysChange: stock.ticker.todaysChange,
      todaysChangePerc: stock.ticker.todaysChangePerc,
    },
  });
});
