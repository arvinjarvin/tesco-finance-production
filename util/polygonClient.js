const { polygonClient, restClient, websocketClient } = require('polygon.io');

exports.polygonRestService = restClient(process.env.POLYGON_API_KEY);
exports.polygonReferenceService = restClient(process.env.POLYGON_API_KEY);
exports.polygonSocketClient = websocketClient(
  process.env.POLYGON_API_KEY
).stocks();
