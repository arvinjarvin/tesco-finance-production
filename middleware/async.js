/**
 * AsyncHandler
 * We pass asyncHandler a function which takes in
 * req<Express.Request>, res<Express.Response>,
 * next<Express.NextFunction> so we can catch errors
 * and call next without having to trycatch with 1000
 * painful blocks to catch some errors. This is then handled
 * by our error handler (/middleware/error.js)
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
module.exports = asyncHandler;
