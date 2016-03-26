require('./helpers/mochawait');
var request = require('supertest');
var expect = require('chai').expect;
request = request('http://medserver.apps.wookieelabs.com/api');

const promisify = req =>
    new Promise((resolve, reject) => {
      req.end((error, res) => error ? reject(error) : resolve(res))
    })
  ;
const notExistingId = '404';

function runTests({token, isForbidden}) {
  return () => {
    const existingOwnId = 'library362';
    const childrensOfExistingOwnId = '322';
    const existingOwnId2 = 'library362';
    const existingAlienId = 'library362';
    const correctData = {
      name: 'Folder test',
      parentId: existingOwnId,
    };
    const deleteItemsWithChild = [
      {
        id: existingOwnId,
        type: 'folder',
      }
    ];
    const deleteItemsWithoutChild = [
      {
        id: existingOwnId2,
        type: 'folder',
      }
    ];

    it('list own folders', async () => {
      const res = await promisify(
        request
          .get(`/folders`)
          .set('Authorization', token)
          .expect(isForbidden ? 403 : 200)
      );
      if (isForbidden) return;
      expect(res.body).to.have.property('name').to.be.a('string');
      expect(res.body).to.have.property('data').to.be.an('array');
      expect(res.body).to.have.property('path').to.be.an('array');
    });

    describe('read', () => {
      it('own existing folder', async () => {
        const res = await promisify(
          request
            .get(`/folders/${existingOwnId}`)
            .set('Authorization', token)
            .expect(isForbidden ? 403 : 200)
        );
        if (isForbidden) return;
        expect(res.body).to.have.property('name').to.be.a('string');
        expect(res.body).to.have.property('data').to.be.an('array');
        expect(res.body).to.have.property('path').to.be.an('array');
      });

      it('missing folder', async () => {
        await promisify(
          request
            .get(`/folders/${notExistingId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .expect(isForbidden ? 403 : 404)
        )
      });

      it('another company folder', async () => {
        await promisify(
          request
            .get(`/folders/${existingAlienId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .expect(isForbidden ? 403 : 404)
        )
      });
    });

    describe('create', () => {

      it('new root folder', async () => {
        const data = {
          name: 'Folder test',
        };
        const { body: postBody } = await promisify(
          request
            .post('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 201)
        );
        if (isForbidden) return;

        expect(postBody).to.have.property('id').to.be.a('number');
        expect(postBody).to.have.property('name').to.be.equal(data.name);
        expect(postBody).to.have.property('parentId').to.be.equal(null);
        const { body: getBody } = await promisify(
          request
            .get(`/folders/${postBody.id}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .expect(isForbidden ? 403 : 200)
        );

        expect(getBody).to.have.property('name').to.be.a('string');
        expect(getBody).to.have.property('data').to.be.an('array');
        expect(getBody).to.have.property('path').to.be.an('array');
      });

      it('new folder inside another', async () => {
        const { body: postBody } = await promisify(
          request
            .post('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(correctData)
            .expect(isForbidden ? 403 : 201)
        );
        if (isForbidden) return;

        expect(postBody).to.have.property('id').to.be.a('number');
        expect(postBody).to.have.property('name').to.be.equal(correctData.name);
        expect(postBody).to.have.property('parentId').to.be.equal(correctData.parentId);

        const { body: getBody } = await promisify(
          request
            .get(`/folders/${postBody.id}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .expect(isForbidden ? 403 : 200)
        );
        expect(getBody).to.have.property('name').to.be.a('string');
        expect(getBody).to.have.property('data').to.be.an('array');
        expect(getBody).to.have.property('path').to.be.an('array');
      });

      it('new folder with incorrect parentId', async () => {
        const data = {
          name: 'Test folder',
          parentId: notExistingId
        };
        await promisify(
          request
            .post('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 400)
        )
      });

      it('new folder with another company parentId', async () => {
        const data = {
          name: 'Test folder',
          parentId: existingAlienId
        };
        await promisify(
          request
            .post('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 400)
        )
      });

      it('new folder without name', async () => {
        const data = {
          parentId: existingOwnId,
        };
        await promisify(
          request
            .post('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 400)
        )
      });

      it('new folder with junk', async () => {
        const data = 'Hello';
        await promisify(
          request
            .post('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 400)
        )
      });
    });

    describe('update', () => {

      it('own existing folder', async () => {
        const data = {
          name: 'Folder test',
          parentId: existingOwnId2
        };
        await promisify(
          request
            .put(`/folders/${existingOwnId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 204)
        );
        if (isForbidden) return;

        const { body: getBody } = await promisify(
          request
            .get(`/folders/${existingOwnId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .expect(isForbidden ? 403 : 200)
        );

        expect(getBody).to.have.property('name').to.be.equal(data.name);
        expect(getBody).to.have.property('parentId').to.be.equal(data.parentId);
      });

      it('not existing folder', async () => {
        await promisify(
          request
            .put(`/folders/${notExistingId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(correctData)
            .expect(isForbidden ? 403 : 404)
        )
      });

      it('folder with wrong parentId', async () => {
        const data = {
          name: 'Folder test',
          parentId: notExistingId,
        };
        await promisify(
          request
            .put(`/folders/${existingOwnId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 400)
        )
      });

      it('folder with root', async () => {
        const data = {
          root: '215',
        };
        await promisify(
          request
            .put(`/folders/${existingOwnId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 400)
        )
      });

      it('another company folder', async () => {
        await promisify(
          request
            .put(`/folders/${existingAlienId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(correctData)
            .expect(isForbidden ? 403 : 404)
        )
      });

      it('folder with junk', async () => {
        await promisify(
          request
            .put(`/folders/${existingOwnId}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send('Hello')
            .expect(isForbidden ? 403 : 400)
        )
      });
    });

    describe('delete', () => {
      it('folder without children', async () => {
        await promisify(
          request
            .delete('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(deleteItemsWithoutChild)
            .expect(isForbidden ? 403 : 204)
        );
        if (isForbidden) return;

        await promisify(
          request
            .get(`/folders/${deleteItemsWithoutChild[0].id}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .expect(isForbidden ? 403 : 404)
        );
      });

      it('folder with children', async () => {
        await promisify(
          request
            .delete('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(deleteItemsWithChild)
            .expect(isForbidden ? 403 : 204)
        );
        if (isForbidden) return;

        await promisify(
          request
            .get(`/folders/${deleteItemsWithChild[0].id}`)
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .expect(isForbidden ? 403 : 404)
        );

        for (let i = 0; i < childrensOfExistingOwnId.length; i++) {
          await promisify(
            request
              .get(`/folders/${childrensOfExistingOwnId[i]}`)
              .set('Authorization', token)
              .set('Content-Type', 'application/json')
              .expect(isForbidden ? 403 : 404)
          );
        }
      });

      it('not existing folder', async () => {
        const data = [
          {
            id: notExistingId,
            type: 'folder',
          }
        ];
        await promisify(
          request
            .delete('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 404)
        )
      });

      it('another company folder', async () => {
        const data = [
          {
            id: existingAlienId,
            type: 'folder',
          }
        ];
        await promisify(
          request
            .delete('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(isForbidden ? 403 : 404)
        )
      });

      it('folder sending junk', async () => {
        await promisify(
          request
            .delete('/folders')
            .set('Authorization', token)
            .set('Content-Type', 'application/json')
            .send('Hello')
            .expect(isForbidden ? 403 : 400)
        )
      });
    });

  }
}

describe('FEATURE: Folders management.', () => {
  describe('As unauthorized user', runTests({
    isForbidden: true,
    token: null
  }));

  describe('As user', runTests({
    isForbidden: false,
    token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzY4LCJpc3N1ZVRpbWUiOjE0NTY2NTMwNjMzNDMsInVzZXJBY2Nlc3MiOiJkZXNrdG9wIiwiaWF0IjoxNDU2NjUzMDYzLCJleHAiOjE0NjE4MzcwNjN9.d-FVfe00zfzKlXiF_i0uD3_57dp9o_JKmJvqXxTUo8Q'
  }));
});
