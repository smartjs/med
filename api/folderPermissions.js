const app = new (require('koa'))();
const route = require('koa-route');
const parse = require('co-body');
const Folder = require('./../db').Folder;
const User = require('./../db').User;

const bunyan = require('bunyan');
const logger = bunyan.createLogger({name: "folderPermissions", streams: [{stream: process.stdout}]});

app.use(async (ctx, next) =>{
   const user = await User.findOne({where: {id: ctx.state.user.id}});
    if (user.type !== 'admin'){
        return ctx.status = 403;
    }

    return next();
});

app.use(route.get('/:id/permissions', async (ctx, folderId, next) => {

    const folder = await getFolderIfExistAndBelongToUserCompany(ctx, folderId);

    if (!folder){
        return ctx.status = 404;
    }

    const users = await folder.getUsers();
    ctx.body = users.map(user => user.id);
    ctx.status = 200;
}));

app.use(route.post('/:id/permissions',  async (ctx, folderId, next) => {

    const folder = await getFolderIfExistAndBelongToUserCompany(ctx, folderId);

    if (!folder){
        return ctx.status = 404;
    }

    try {
        var data = await parse.json(ctx.req);
    } catch (err) {
        logger.error(err);
    }

    if (!Array.isArray(data)) {
        return ctx.status = 400;
    }

    for (item of data){
        if (typeof item !== 'number') {
            return ctx.status = 400;
        }
    }

    const result = await User.findAndCountAll({where: {id: data}});
    if (result.count !== data.length) {
        return ctx.status = 404;
    }

    folder.setUsers(data);
    ctx.status = 200;
}));

async function getUser(ctx, userId){
    const user = await User.findOne({where: {id: ctx.state.user.id}});
    if (user.type === 'mobile'){
        return ctx.status = 403;
    }
}

async function getFolderIfExistAndBelongToUserCompany(ctx, folderId){
    try{
        var folder = await Folder.findOne({where: {id: folderId, companyId: ctx.state.user.companyId}});
    }catch (err){
        logger.error(`Error while getting folder with id ${folderId}: ${err}`);
    }
    return folder;
}

module.exports = app;