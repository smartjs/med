'use strict';

const app = new (require('koa'))();
const router = require('koa-router')();
const convert = require('koa-convert');
const User = require('./../db').User;
const debug = require('debug')('auth');
const promisify = require("promisify-node");
const bcrypt = promisify(require('bcrypt-nodejs'));
const parse = require('co-body');
const util = require('util');

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
            ctx.state.login = data.login;
            return next();
        }

        ctx.status = 403;
        ctx.body = 'Incorrect password';
        return next();
    }

    ctx.status = 404;
    ctx.body = 'User not found';
    return next();
});

app.use(router.routes());

module.exports = app;