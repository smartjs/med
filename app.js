const app = new (require('koa'))();
const debug = require('./debug');
const mount = require('./mount');
const router = require('koa-router')();
const authHandler = require('./api/auth');
const tokenGenerator = require('./api/token');

(async () => {

    if (process.env.TEST){
        await debug;
    }

    router.head('/', async (ctx, next) => {
        ctx.status = 200;
        return next();
    });

    app.use(router.routes());
    app.use(mount('/auth', authHandler));
    app.use(tokenGenerator);

})();

module.exports = app;
