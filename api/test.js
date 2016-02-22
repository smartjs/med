const Koa = require('koa');
const app = new Koa();


app.use((ctx, next) => {
  ctx.body = 'ok';
  next();
});

module.exports = app;
