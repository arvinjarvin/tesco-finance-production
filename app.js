/**
 * Tesco Finance
 * [IMPORTANT] To correctly enable subdomains use a staging/production environment or instead of localhost use http://lvh.me/ (e.g finance.api.lvh.me)
 * by Arvin Abdollahzadeh
 */

const path = require('path');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, 'config', '.env.production'),
});

const fs = require('fs');

const vhost = require('./lib/vhost/index');
const http = require('http');
const ws = require('ws');
const express = require('express');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

/** Security */
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const dbConnect = require('./config/db.config');
const errorHandler = require('./middleware/error');
const JSDoc = require('express-jsdoc-swagger');
const constants = require('./constants');
const subdomain = require('./middleware/subdomain');
const WebSocket = require('ws');
const { handleUpgrade } = require('./util/socketUpgrade');
const PublicHeroSocket = require('./util/PublicSocket');
const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

dbConnect();
const app = express();
exports.services = [];

const swaggerDoc = JSDoc(app)(constants.SWAGGER_CONFIG);

app.use(express.json()); // Parse JSON payload to <Express.Request>::body

function getNonce(req, res) {
  return null;
  // Future asset nonce implementation for CSRF
}

if (!dev) {
  console.warn(`[FINANCE_API] WARN: PRODUCTION`);
  app.use(cookieParser());
  app.use(csrf({ cookie: true }));
  app.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });

  console.log(`Production: enabled csrf security.`);
} else app.use(morgan('dev'));

// app.use(helmet()); don't have time to set up nonces
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(cors());

/**
 * -- Dynamically Mount Routes.
 * By examining the files asyncronously in /routes
 * and checking that they all export a function
 * (Function<Express.Router>) we can determine which
 * routes need to be mounted and do so without importing
 * the files individually every time we create a new route.
 */
fs.readdirSync(path.join(__dirname, 'routes'))
  .filter((f) => f.slice(f.length - 3) === '.js') // filter out files that don't e
  .forEach((r) => {
    let route = require(`./routes/${r}`);
    if (typeof route !== 'function') return; // check that the route is of type function (Function<Express.Router>) and filter otherwise
    console.log(`[FINANCE_API] +API ${r.split('.')[0]}.api.[ROOT_DOMAIN]`);
    app.use(subdomain(`${r.split('.')[0]}.api`, route)); // implement the router as an app listener
    app.use(`/api/${r.split('.')[0]}`, route);
    this.services.push({
      name: r.split('.')[0].toUpperCase(),
      accessPoints: [`%PUBLIC_URL%/api/${r.split('.')[0]}`],
    });
  });

if (!dev) {
  app.use(express.static(path.join(__dirname, 'public')));
}
app.use(errorHandler);

let wss = new WebSocket.Server({ noServer: true });
app.set('publicWS', new PublicHeroSocket(wss));
const server = http.createServer(app);

server.on('upgrade', (r, s, h) => handleUpgrade(r, s, h, app));
if (!dev) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
}

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`[FINANCE_API] Listening on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  server.close(() => process.exit(1));
});
