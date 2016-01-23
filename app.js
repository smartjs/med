const app = new (require('koa'))();
const debug = require('./debug');
const mount = require('./mount');
const auth = require('./api/auth');
const config = require('./config');

app.use(mount('/auth', auth));

app.use(async (ctx, next) => {
  console.log("CTX.PATH", ctx.path)
  return next();
});


/*debug.then(() => {
  console.log('done');
}, (e) => {console.log(e);});*/

app.listen(config.port);
module.exports = app;
