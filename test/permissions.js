const request = require('supertest');
const app = require('./../app.js');
//const server = request.agent(app.listen());
const config = require('./../config');
const jwt = require('jsonwebtoken');
const debug = require('./../debug');
const should = require('chai').should();
const util = require('util')

const adminToken = jwt.sign({id: 1, companyId:1}, config.secretKey);
const mobileToken = jwt.sign({id: 3, companyId:1}, config.secretKey);


var server;

describe('Folder permissions', function(){

    before(function(done){
        app.then(app => {
            server = request.agent(app.listen());
            done();
        }, err => {
            done(err);
        })
    })

    describe('as admin', testsByUser.bind(null, adminToken, true));
    describe('as mobile', testsByUser.bind(null, mobileToken, false));
})



function testsByUser(token, isPermitted){

    var adminToken2;
    var mobileToken2;
    var code;

    before(function(done){
        adminToken2 = jwt.sign({id: 1, companyId:2}, config.secretKey);
        mobileToken2 = jwt.sign({id: 3, companyId:2}, config.secretKey);
        debug.then(res => {done();}, err => {done(err);});
    });

    describe("When a token is invalid", function(){
        it("GET with invalid token", function(done){
            server
                .get('/folder/1/permissions')
                .set('Authorization', 'Bearer ' + 'invalid_token_bla-bla')
                .expect(401, done);
        });

        it("POST with invalid token", function(done){
            server
                .post('/folder/1/permissions')
                .set('Authorization', 'Bearer ' + 'invalid_token_bla-bla')
                .type('form')
                .send([1,2])
                .expect(401, done);
        });
    });

    describe("When folderId doesn't exist", function(){
        it("GET with wrong folderId", function(done){
            code = isPermitted ? 404 : 403;
            server
                .get('/folder/404/permissions')
                .set('Authorization', 'Bearer ' + token)
                .expect(code, done);
        });

        it("POST with wrong folderId", function(done){
            code = isPermitted ? 404 : 403;
            server
                .post('/folder/404/permissions')
                .set('Authorization', 'Bearer ' + token)
                .type('form')
                .send([1,2])
                .expect(code, done);
        });
    });

    describe("When response is valid", function(){
        it('GET with valid response', function(done){
            code = isPermitted ? 200 : 403;
            server
                .get('/folder/1/permissions')
                .set('Authorization', 'Bearer ' + token)
                .expect(code)
                .end(function(err,res){
                    if (err) done(err);
                    if (isPermitted) res.body.should.be.a('array');
                    done();
                });
        });
    })


    describe("When data is invalid", function(){
        it("POST with invalid data", function(done){
            code = isPermitted ? 400 : 403;
            server
                .post('/folder/1/permissions')
                .set('Authorization', 'Bearer ' + token)
                .type('form')
                .send("INVALID DATA")
                .expect(code, done);
        });
    });


    describe("When we send incorrect users data", function(){
        it('POST with an array of id-s of non-existant users', function(done){
            code = isPermitted ? 404 : 403;
            server
                .post('/folder/1/permissions')
                .set('Authorization', 'Bearer ' + token)
                .send([1, 400])
                .expect(code, done);
        });
    });


    describe("When permissions are correctly set", function(){
        it('POST new permissions and GET them back', async function(done){
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
                    .expect(code)
                    .end(function(err, res){
                        if (err) return reject(err);
                        if (isPermitted) res.body.join('').should.be.equal('12');
                        resolve(res);
                    });
            });

            done();
        });
    });


    describe("When an user from other company is trying to get access to a folder", function(){
        it('GET by user from other company', function(done){
            code = isPermitted ? 404 : 403;
            var localToken = isPermitted ? adminToken2 : mobileToken2;
            server
                .get('/folder/1/permissions')
                .set('Authorization', 'Bearer ' + localToken)
                .expect(code, done);
        });
    });
}


