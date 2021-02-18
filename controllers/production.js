const asyncHandler = require('../middleware/async');
const { services } = require('../app');

exports.developerGetServices = asyncHandler(async (req, res, next) => {
  console.log(services);
  res.status(200).json(services);
});
