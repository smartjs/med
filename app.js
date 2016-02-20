const debug = require('./debug');
const Koa = require('koa');
const app = new Koa();
const router = new (require('koa-router'))();
const convert = require('koa-convert');
const jwt = require('koa-jwt');
const mount = require('./mount');
const auth = require('./api/auth.js');

app.use(mount('/auth', auth));
app.use(convert(function *(next){
  const start = new Date;
  yield next;
  const ms = new Date - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
}));

app.listen(3000);
