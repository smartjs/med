const app = new (require('koa'))();
const debug = require('./debug');
const mount = require('./mount');
const route = require('koa-route');
const authHandler = require('./api/auth');
const config = require('./config');
const koaJwt = require('koa-jwt');
const Folder = require('./db').Folder;
const User = require('./db').User;
const convert = require('koa-convert');
const parse = require('co-body');
const util = require('util');

const bunyan = require('bunyan');
const logger = bunyan.createLogger({name: "app", streams: [{stream: process.stdout}]});

//TODO: add logging (bunyan)

async function main(){

    if (process.env.TEST){
        await debug;
    }

    app.use(route.head('/', async (ctx, next) => {
        ctx.status = 200;
    }));

    app.use(mount('/auth', authHandler));
    app.use(convert(koaJwt({secret: config.secretKey/*,  passthrough: true*/})));

    app.use(route.get('/folder/:id/permissions', async (ctx, folderId, next) => {

        const folder = await getFolderIfExist(ctx, folderId);

        if (!folder){
            ctx.status = 404;
            ctx.body = 'Folder not found';
            return //next();
        }

        const checkPassed = await checkIfUserAndFolderBelongToSameCompany(ctx, folder);
        if (!checkPassed){
            return;
        }

        const users = await folder.getUsers();
        ctx.body = users.map(user => user.id);
        ctx.status = 200;

        return next();
    }));

    app.use(route.post('/folder/:id/permissions',  async (ctx, folderId, next) => {

        ctx.status = 200;
        const folder = await getFolderIfExist(ctx, folderId);

        if (!folder){
            ctx.status = 404;
            ctx.body = 'Folder not found';
            return;
        }

        const checkPassed = await checkIfUserAndFolderBelongToSameCompany(ctx, folder);
        if (!checkPassed){
            return;
        }

        try {
            var data = await parse.json(ctx.req);
        } catch (err) {
           logger.error(err);
        }


        if (!Array.isArray(data)) {
            ctx.status = 400;
            ctx.body = "Data must be an array";
            return// next();
        }

        for (item of data){
            if (typeof item !== 'number') {
                ctx.status = 400;
                ctx.body = "Only numbers allowed in array";
                return// next();
            }

            const user = await User.findOne({where: {id: item}});

            if (!user) {
                ctx.status = 404;
                ctx.body = 'Wrong userId';
                return// next();
            }
        }

        if (ctx.status === 200){
            folder.setUsers(data);
        }
    }));

    async function checkIfUserAndFolderBelongToSameCompany(ctx, folder) {
        try{
            var user = await User.findOne({where: {id: ctx.state.user.id}});
        } catch (err){
            throw new Error(`User not found: ${err}`);
        }

        if (!user){
            ctx.status = 404;
            ctx.body = 'User not found';
            return false;
        }

        if (user.CompanyId !== folder.CompanyId){
            ctx.status = 403;
            ctx.body = 'Folder belongs another company';
            return false;
        }

        return true;
    }

    async function getFolderIfExist(ctx, folderId){
        try{
            var folder = await Folder.findOne({where: {id: folderId}});
        }catch (err){
            logger.error(`Error while getting folder with id ${folderId}: ${err}`);
        }

        ctx.state.folder = folder;
        return folder;
    }

    return app;
};

module.exports = main();
