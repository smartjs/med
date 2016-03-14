const Koa = require('koa');
const koaRoute = require('koa-route');
const db = require('../db');
const app = new Koa();

app.use(koaRoute.get('/:id', async (ctx, id, next) => {
  console.log("GET ALL MEDIA CALLED ");
  let folderId = id;
  let medias = await db.Media.findAll({where:{folderId: folderId}});
  if(medias){
    ctx.body = { data: medias};
  } else {
    ctx.body = { data: "{}"};
  }
  next();
}));

module.exports = app;
