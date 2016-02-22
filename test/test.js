var app = require('../app.js');
var request = require('supertest').agent(app.listen());

describe('POST /test', function(){
  it('respond with text', function(done){
    request
    .get('/test')
    .expect(200)
    .end(function(err, res){
      if (!err){
        console.log('Smoke test is finished!');
      } else{
        console.log('Smoke test is fail!');
        console.log(err);
      }
      done();
    });
  })
})


describe('POST /auth', function(){
  it('respond with json', function(done){
    request
    .post('/auth')
    .type('form')
    .send({login: 'demo2', password: 'demo2'})
    .expect(200)
    .end(function(err, res){
      if (err){
        console.log('Auth doesn\'t work!');
      } else{
        console.log('Auth works!');
        console.log(res.body);
      }
      done();
    });
  })
})
