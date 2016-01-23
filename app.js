const app = new (require('koa'))();
const debug = require('./debug');
const mount = require('./mount');
const auth = require('./api/auth')

app.use(mount('auth', auth));

app.use(async (ctx, next) => {
  "use strict";
  console.log("CTX.PATH", ctx.path)
  return next();
});

/*
debug.then(() => {
  console.log('done');
}, (e) => {console.log(e);});
*/

module.exports = app;
