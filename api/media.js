const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const db = require('../db');
const config = require('../config');
const convert = require('koa-convert');
const debug = require('debug')('media');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

router.get('/:id', async (ctx) => {
  let media = await db.Media.findById(ctx.params.id);
  if (media && media.convertedFile) {
    ctx.status = 200;
    ctx.body = media;
  } else {
    ctx.status = 404;
  }
});

router.put('/:id', async (ctx) => {
  let media = await db.Media.findById(ctx.params.id);
  if (media && media.convertedFile) {
    media = await media.update(ctx.request.body)
    ctx.status = 200;
    ctx.body = media;
  } else {
    ctx.status = 404;
  }
});

app.use(router.routes());
module.exports = app;