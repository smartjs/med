const Koa = require('koa');
const cobody = require('co-body');
const db = require('../db');
const co = require('co');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const koaRoute = require('koa-route');
const app = new Koa();


app.use(koaRoute.post('/', async (ctx, next) => {
  var body = await cobody.form(ctx);
  if(body){
    var receivedLogin = body.login;
    var receivedPassword = body.password;
    console.log("receive something " +receivedLogin + " receivedLogin " + receivedPassword);
    if(receivedLogin && receivedPassword){
      //looking for user
      var result = await co(function* () {
         return yield db.User.findOne({where:{login : receivedLogin}});
      });

      if(result && bcrypt.compareSync(receivedPassword, result.password)){
        var user = {
          id: result.id,
          time: (new Date()).ms
        };
        var tokenresult = jwt.sign(user, process.env.Secret, {
          expiresInMinutes: 1440, // expires in 24 hours
        });
        var answer = {token : tokenresult};
        ctx.body = answer;
      }
    }
  }
  next();
}));

module.exports = app;
