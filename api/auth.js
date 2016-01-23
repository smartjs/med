'use strict';

const app = new (require('koa'))();
const router = require('koa-router')();
const convert = require('koa-convert');
const User = require('./../db').User;
const debug = require('debug')('auth');

const parse = require('co-body');

router.post('/login', async (ctx, next) => {

    let data = await parse.form(ctx.req);

    try{
        //password should be de-cripted somehow??
        var user = await User.findOne({where: {login: data.login/*, password: data.password*/}});
    } catch (e) {
        //   throw e;
        console.error(e)
    }

    debug("DONE")


    if (user){
        ctx.status = 200;
        return ctx.body = "the token";
    }

    ctx.status = 404;
    ctx.body = 'Bye';
});

app.use(router.routes());

module.exports = app;