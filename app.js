const debug = require('./debug');
const Koa = require('koa');
const mount = require('./mount');
const auth = require('./api/auth.js');

debug.then(() => {
  console.log('done');
}, (e) => {
  console.log(e);
});

const app = new Koa();
app.use(mount('/auth', auth));

module.exports = app;
