const request = require('supertest');
const app = require('./../app.js')
const config = require('./../config');
const debug = require('./../debug');
const User = require('./../db').User;
const bcrypt = require('bcrypt-nodejs');
const util = require('util');
const jwt = require('jsonwebtoken');

describe('MAIN', function(){

    var server;
    var token;

    before(function(done){
        app.then(app => {
           server = request.agent(app.listen());
           token = jwt.sign({id: 1}, config.secretKey);
           done();
        }, err => {
           done(err);
        })
    })

    describe('Testing if app is running', function(){
        describe('Send HEAD request', function(){
            it ('Should return status 200', function(done){
                server
                    .head('/')
                    //.set('Authorization', 'Bearer ' + token)
                    .expect(200, done);
            })
        });
    });

    describe('Testing login', function(){
        before(function(done){
            debug.then(res => {done();}, err => {done(err);});
        });

        describe('User is not found', function(){
            it('Should return 404', function(done){
                server
                    .post('/auth/login')
                    //.set('Authorization', 'Bearer ' + token)
                    .type('form')
                    .send({login: 'some_login'})
                    .expect(404, done);
            })
        });

        describe('Incorrect password', function(){
            it('Should return 403', function(done){
                server
                    .post('/auth/login')
                    //.set('Authorization', 'Bearer ' + token)
                    .type('form')
                    .send({login: 'demo', password: 'some_password'})
                    .expect(403, done);
            })
        });

        describe('Login successful', function(){
            it('Should return 200', function(done){
                server
                    .post('/auth/login')
                    //.set('Authorization', 'Bearer ' + token)
                    .type('form')
                    .send({login: 'demo', password: 'demo'})
                    .expect(200, done);
            })
        });
    });
})

