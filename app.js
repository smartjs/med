const debug = require('./debug');
const Koa = require('koa');
const mount = require('./mount');
const auth = require('./api/auth.js');
const media = require('./api/media.js');
const folder = require('./api/folder.js');
const test = require('./api/test.js');
const configs = require('./configindex.js');
const convert = require('koa-convert');
const jwt = require('koa-jwt');


debug.then(() => {
  console.log('done');
}, (e) => {
  console.log(e);});

  console.log(getTestToken());

const app = new Koa();
app.use(mount('/test', test));
app.use(mount('/auth', auth));
app.use(convert.compose(jwt({ secret: process.env.Secret })));
app.use(mount('/api/folders', folder));
app.use(mount('/api/media', media));

// app.listen(configs.PORT);
module.exports = app;


function getTestToken(){
  var user = {
    id: 1,
    time: (new Date()).ms
  };
  return jwt.sign(user, process.env.Secret, {
    expiresInMinutes: 1440, // expires in 24 hours
  });

}
