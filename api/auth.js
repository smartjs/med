const Koa = require('koa');
const app = new Koa();
const router = new (require('koa-router'))();

router.get('/test', async function (ctx) { ctx.body = 'Test';});

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;