const app = new (require('koa'))();
const debug = require('./debug');
const mount = require('./mount');
const route = require('koa-route');
const authHandler = require('./api/auth');
const folderPermissionsHandler = require('./api/folderPermissions');
const config = require('./config');
const koaJwt = require('koa-jwt');
const convert = require('koa-convert');
const util = require('util');

async function main(){

    if (process.env.TEST){
        await debug;
    }

    app.use(route.head('/', async (ctx, next) => {
        ctx.status = 200;
    }));

    app.use(mount('/auth', authHandler));
    app.use(convert(koaJwt({secret: config.secretKey/*,  passthrough: true*/})));
    app.use(mount('/folder', folderPermissionsHandler));

    return app;
};

module.exports = main();
