module.exports.GatewayOPCodes = {
  EVENT: 0,
  HEARTBEAT: 1,
  IDENTIFY: 2,
  CREDENTIALS: 3,
};

module.exports.PUBLIC_FEED = ['AAPL', 'MSFT', 'DIA', 'SPY', 'DNN'];

module.exports.SWAGGER_CONFIG = {
  info: {
    version: '1.0.0',
    title: 'Tesco Finance',
    license: {
      name: 'UNLICENSED',
    },
    contact: {
      name: 'Arvin Abdollahzadeh',
      email: 'arvinzadeh@gmail.com',
    },
    description: 'Tesco Finance backend',
  },
  security: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  filesPattern: './**/*.js',
  swaggerUIPath: '/swagger',
  baseDir: './',
  exposeSwaggerUI: false,
  exposeApiDocs: true,
  apiDocsSubdomain: 'developer.api',
  apiDocsPath: '/openapi',
};
