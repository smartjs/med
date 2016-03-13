const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const db = require('../db');
const config = require('../config');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const convert = require('koa-convert');
const debug = require('debug')('auth');

const app = new Koa();
const router = new Router();
app.use(bodyParser());

router.post('/login', async (ctx) => {
  debug('enter login');
  let currentUser = {};

  let user = await db.User.findOne({
    where: {
      $or: [
        {login: ctx.request.body.login},
        {email: ctx.request.body.email}
      ]
    }
  });

  if (!user || !bcrypt.compareSync(ctx.request.body.password, user.dataValues.password)) {
    debug('not valid user', user.dataValues.id);
    ctx.throw('Incorrect user or password', 400);
    return;
  }

  debug('valid user', user.dataValues.id);
  currentUser.id = user.dataValues.id;
  currentUser.date = new Date();
  let token = jwt.sign(currentUser, config.secret);
  ctx.body = {token: token};
  ctx.status = 200;
});

app.use(router.routes());
module.exports = app;
