const sequelizeErrors = require('sequelize/lib/errors');

const devEnv = process.env.NODE_ENV == 'development';

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = devEnv ? 500 : 404;
    if (devEnv) {
      let errorObject = {
        error: err.message
      }
      if (err instanceof sequelizeErrors.DatabaseError) {
        errorObject.error = `Database error: ${err.message}`;
      }
      ctx.body = errorObject;
    }
  }
};