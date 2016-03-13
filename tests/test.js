var request = require('supertest');
var app = require('../app.js');

var server = request.agent(app.listen());

describe('SIMPLE test', function () {
  it('app should run', function (done) {
    server
      .head('/')
      .expect(404)
      .end(done);
  });
});

describe('Auth test', function () {
  it('auth should run', function (done) {
    server
      .post('/auth')
      .expect(200)
      .end(function (err, res) {
        done();
      });
  });
});
