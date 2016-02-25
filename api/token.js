'use strict';

module.exports = async (ctx, next) => {
  if (ctx.state.login){
      ctx.body = "the token";
      ctx.status = 200;
  }

  next();
};