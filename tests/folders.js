require('./helpers/mochawait');
var request = require('supertest');
var expect = require('chai').expect;
request = request('http://medserver.apps.wookieelabs.com/api');
var token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzY4LCJpc3N1ZVRpbWUiOjE0NTY2NTMwNjMzNDMsInVzZXJBY2Nlc3MiOiJkZXNrdG9wIiwiaWF0IjoxNDU2NjUzMDYzLCJleHAiOjE0NjE4MzcwNjN9.d-FVfe00zfzKlXiF_i0uD3_57dp9o_JKmJvqXxTUo8Q';

const promisify = req =>
    new Promise((resolve, reject) => {
      req.end((error, res) => error ? reject(error) : resolve(res))
    })
  ;

describe('Folders READ test', () => {
  it('GET without token', done => {
    request
      .get('/folders/library362')
      .expect(403)
      .end(done);
  });
  it('GET with token', done => {
    request
      .get('/folders/library362')
      .set('Authorization', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('name').to.be.a('string');
        expect(res.body).to.have.property('data').to.be.an('array');
        expect(res.body).to.have.property('path').to.be.an('array');
        done();
      });
  });
});

describe('Folders READ by id tests', () => {
  it('GET without token', done => {
    request
      .get('/folders/208')
      .expect(403)
      .end(done);
  });

  it('GET with token', done => {
    request
      .get('/folders/208')
      .set('Authorization', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('name').to.be.a('string');
        expect(res.body).to.have.property('data').to.be.an('array');
        expect(res.body).to.have.property('path').to.be.an('array');
        done();
      });
  });

  it('GET missing folder by id', done => {
    request
      .get('/folders/404')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .expect(404)
      .end(done);
  });

  it('GET another company folder by id', done => {
    request
      .get('/folders/22')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .expect(404)
      .end(done);
  });
});

const correctData = {
  name: 'Folder test',
  parentId: '215',
};
describe('Folders CREATE tests', () => {
  it('POST new folder without token', done => {
    request
      .post('/folders')
      .send(correctData)
      .expect(403)
      .end(done);
  });

  it('POST new folder without parentId', async () => {
    const data = {
      name: 'Folder test',
    };
    const { body: postBody } = await promisify(
      request
        .post('/folders')
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .send(data)
        .expect(201)
    );

    expect(postBody).to.have.property('id').to.be.a('number');
    expect(postBody).to.have.property('name').to.be.equal(data.name);
    expect(postBody).to.have.property('parentId').to.be.equal(null);
    const { body: getBody } = await promisify(
      request
        .get(`/folders/${postBody.id}`)
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .expect(200)
    );
    expect(getBody).to.have.property('name').to.be.a('string');
    expect(getBody).to.have.property('data').to.be.an('array');
    expect(getBody).to.have.property('path').to.be.an('array');
  });

  it('POST new folder with parentId', async () => {
    const { body: postBody } = await promisify(request
      .post('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(correctData)
      .expect(201)
    );
    expect(postBody).to.have.property('id').to.be.a('number');
    expect(postBody).to.have.property('name').to.be.equal(correctData.name);
    expect(postBody).to.have.property('parentId').to.be.equal(correctData.parentId);

    const { body: getBody } = await promisify(
      request
        .get(`/folders/${postBody.id}`)
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .expect(200)
    );
    expect(getBody).to.have.property('name').to.be.a('string');
    expect(getBody).to.have.property('data').to.be.an('array');
    expect(getBody).to.have.property('path').to.be.an('array');
  });

  it('POST new folder with incorrect parentId', done => {
    const data = {
      name: 'Kate folder',
      parentId: '-1'
    };
    request
      .post('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(400)
      .end(done);
  });

  it('POST new folder with another company parentId', done => {
    const data = {
      name: 'Kate folder',
      parentId: '22'
    };
    request
      .post('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(400)
      .end(done);
  });

  it('POST new folder without name', done => {
    const data = {
      parentId: '215',
    };
    request
      .post('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(400)
      .end(done);
  });

  it('POST new folder with junk', done => {
    const data = 'Hello';
    request
      .post('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(400)
      .end(done);
  });
});

describe('Folders UPDATE', () => {
  it('PUT folder without token', done => {
    request
      .put('/folders/211')
      .send(correctData)
      .expect(403)
      .end(done);
  });

  it('PUT existing folder', async () => {
    const data = {
      name: 'Folder test',
      parentId: '215'
    };
    await promisify(
      request
        .put('/folders/211')
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .send(data)
        .expect(204)
    );

    const { body: getBody } = await promisify(
      request
        .get(`/folders/211`)
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .expect(200)
    );

    expect(getBody).to.have.property('name').to.be.equal(data.name);
    expect(getBody).to.have.property('parentId').to.be.equal(data.parentId);
  });

  //it('PUT missing folder', done => {
  //  request
  //    .put('/folders/404')
  //    .set('Authorization', token)
  //    .set('Content-Type', 'application/json')
  //    .send(correctData)
  //    .expect(404)
  //    .end(done);
  //});

  it('PUT folder with wrong parentId', done => {
    const data = {
      name: 'Folder test',
      parentId: '404',
    };
    request
      .put('/folders/211')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(400)
      .end(done);
  });

  it('PUT folder with root', done => {
    const data = {
      root: '215',
    };
    request
      .put('/folders/211')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(400)
      .end(done);
  });

  it('PUT another company folder', done => {
    request
      .put('/folders/22')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(correctData)
      .expect(404)
      .end(done);
  });

  it('PUT folder with junk', done => {
    request
      .put('/folders/211')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send('Hello')
      .expect(400)
      .end(done);
  });
});

const deleteItems = [
  {
    id: 211,
    type: 'folder',
  }
];
describe('Folders DELETE', () => {
  it('Remove without token', done => {
    request
      .delete('/folders')
      .send(deleteItems)
      .expect(403)
      .end(done);
  });

  it('Remove another company folder', done => {
    request
      .delete('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(deleteItems)
      .expect(404)
      .end(done);
  });

  it('Remove folder sending junk', done => {
    request
      .delete('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send('Hello')
      .expect(400)
      .end(done);
  });

  it('Remove missing folder', done => {
    const data = [
      {
        id: 404,
        type: 'folder',
      }
    ];
    request
      .delete('/folders')
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(404)
      .end(done);
  });

  it('Remove folder without children', async () => {
    const data = [
      {
        id: 263,
        type: 'folder',
      }
    ];
    await promisify(
      request
        .delete('/folders')
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .send(data)
        .expect(204)
    );
    await promisify(
      request
        .get(`/folders/${data[0].id}`)
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .expect(404)
    );
  });

  it('Remove folder with children', async () => {
    const data = [
      {
        id: 208,
        type: 'folder',
      }
    ];
    const children = [263];
    await promisify(
      request
        .delete('/folders')
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .send(data)
        .expect(204)
    );

    await promisify(
      request
        .get(`/folders/${data[0].id}`)
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
        .expect(404)
    );

    for (let i = 0; i < children.length; i++) {
      await promisify(
        request
          .get(`/folders/${children[i]}`)
          .set('Authorization', token)
          .set('Content-Type', 'application/json')
          .expect(404)
      );
    }
  });
});
