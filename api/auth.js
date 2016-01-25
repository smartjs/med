'use strict';

const app = new (require('koa'))();
const router = require('koa-router')();
const convert = require('koa-convert');
const User = require('./../db').User;
const debug = require('debug')('auth');
const promisify = require("promisify-node");
const bcrypt = promisify(require('bcrypt-nodejs'));
const parse = require('co-body');

router.post('/login', async (ctx, next) => {

    let data = await parse.form(ctx.req);

    try{
        var user = await User.findOne({where: {login: data.login}});
    } catch (e) {
        throw e;
    }

    if (user) {
        const isPasswordCorrect = await bcrypt.compare(data.password, user.password);
        if (isPasswordCorrect) {
            ctx.status = 200;
            return ctx.body = "the token";
        }

        ctx.status = 403;
        ctx.body = 'Incorrect password';
        return;
    }

    ctx.status = 404;
    ctx.body = 'User not found';
});

app.use(router.routes());

module.exports = app;