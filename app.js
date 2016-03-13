const debug = require('./debug');
const Koa = require('koa');
const mount = require('./mount');
const convert = require('koa-convert');
const config = require('./config');
const api = require('./api');
const errorHandler = require('./middlewares/errorHandler');

const koaJwt = require('koa-jwt');

const app = new Koa();
app.use(errorHandler);
app.use(mount('/auth', api.auth));
let jwtMiddleware = convert(koaJwt({ secret: config.secret }));
app.use(jwtMiddleware);
app.use(mount('/media', api.media));

module.exports = app;
