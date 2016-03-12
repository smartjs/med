const request = require('supertest');
const app = require('./../app.js');
//const server = request.agent(app.listen());
const config = require('./../config');
const jwt = require('jsonwebtoken');
const debug = require('./../debug');
const should = require('chai').should();
const util = require('util')

const adminToken = jwt.sign({id: 1}, config.secretKey);
const mobileToken = jwt.sign({id: 3}, config.secretKey);


var server;

describe('Testing permissions', function(){

    before(function(done){
        app.then(app => {
            server = request.agent(app.listen());
            done();
        }, err => {
            done(err);
        })
    })

    describe('as admin', testsByUser.bind(null, adminToken, true));
    //describe('as mobile', testsByUser.bind(null, mobileToken, false));
})



function testsByUser(token, isPermitted){

    describe("Test permissions", function(){

        var token2;
        var code;

        before(function(done){
            token2 = jwt.sign({id: 2}, config.secretKey);
            debug.then(res => {done();}, err => {done(err);});
        });



        describe("GET with invalid token", function(){
            it("Should return " + code, function(done){
                code = (isPermitted) ? 401 : 403;
                server
                    .get('/folder/1/permissions')
                    .set('Authorization', 'Bearer ' + 'invalid_token_bla-bla')
                    .expect(code, done);
            });
        });


        describe("POST with invalid token", function(){
            it("Should return " + code, function(done){
                code = isPermitted ? 401 : 403;
                server
                    .post('/folder/1/permissions')
                    .set('Authorization', 'Bearer ' + 'invalid_token_bla-bla')
                    .type('form')
                    .send([1,2])
                    .expect(code, done);
            });
        });


        describe("GET with wrong folderId", function(){
            it("Should return " + code, function(done){
                code = isPermitted ? 404 : 403;
                server
                    .get('/folder/404/permissions')
                    .set('Authorization', 'Bearer ' + token)
                    .expect(code, done);
            });
        });


        describe("POST with wrong folderId", function(){
            it("Should return " + code, function(done){
                code = isPermitted ? 404 : 403;
                server
                    .post('/folder/404/permissions')
                    .set('Authorization', 'Bearer ' + token)
                    .type('form')
                    .send([1,2])
                    .expect(code, done);
            });
        });


        describe("GET with valid response", function(){
            it('Should return ' + code, function(done){
                code = isPermitted ? 200 : 403;
                server
                    .get('/folder/1/permissions')
                    .set('Authorization', 'Bearer ' + token)
                    .expect(code)
                    .end(function(err,res){
                        if (err) done(err);
                        res.body.should.be.a('array');
                        done();
                    });
            });
        });


        describe("POST with invalid data", function(){
            it('Should return ' + code, function(done){
                code = isPermitted ? 400 : 403;
                server
                    .post('/folder/1/permissions')
                    .set('Authorization', 'Bearer ' + token)
                    .type('form')
                    .send("INVALID DATA")
                    .expect(code, done);
            });
        });


        describe("POST with an array of id-s of non-existant users", function(){
            it('Should return ' + code, function(done){
                code = isPermitted ? 404 : 403;
                server
                    .post('/folder/1/permissions')
                    .set('Authorization', 'Bearer ' + token)
                    .send([1, 400])
                    .expect(code, done);
            });
        });


        describe("POST new permissions and GET them back", function(){
            it('Should return ' + code, async function(done){
                code = isPermitted ? 200 : 403;
                await new Promise(function(resolve, reject){
                    server
                        .post('/folder/2/permissions')
                        .set('Authorization', 'Bearer ' + token)
                        .send([1,2])
                        .expect(code)
                        .end(function(err, res){
                            if (err) return reject(err);
                            resolve(res);
                        })
                });

                await new Promise(function(resolve, reject){
                    server
                        .get('/folder/2/permissions')
                        .set('Authorization', 'Bearer ' + token)
                        .expect(code, [1,2])
                        .end(function(err, res){
                            if (err) return reject(err);
                            resolve(res);
                        });
                });

                done();
            });
        });


        describe("GET by user from other company", function(){
            it('Should return ' + code, function(done){
                code = isPermitted ? 403 : 403;
                server
                    .get('/folder/1/permissions')
                    .set('Authorization', 'Bearer ' + token2)
                    .expect(code, done);
            });
        });
    });
}


