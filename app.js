const debug = require('./debug');
const Koa = require('koa');
const mount = require('./mount');
const auth = require('./api/auth.js');
const test = require('./api/test.js');
const configs = require('./configindex.js');


debug.then(() => {
  console.log('done');
}, (e) => {
  console.log(e);});

const app = new Koa();
app.use(mount('/auth', auth));
app.use(mount('/test', test));

// app.listen(configs.PORT);
module.exports = app;
