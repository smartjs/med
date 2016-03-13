const request = require('supertest');
const chai = require('chai');
const config = require('../config');
const server = request('http://localhost:' + config.serverPort);
const desktopToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZGF0ZSI6IjIwMTYtMDMtMTNUMDg6MzA6NTkuMTcxWiIsImlhdCI6MTQ1Nzg1Nzg1OX0._WupY2VeZ-zu0lKBqFXhTNl2WwQyQNpymFubUb73Hxg';
const mobileUserToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NzgzLCJpc3N1ZVRpbWUiOjE0NTY2NjcwNTExMTEsInVzZXJBY2Nlc3MiOiJtb2JpbGUiLCJpYXQiOjE0NTY2NjcwNTEsImV4cCI6MTQ2MTg1MTA1MX0.ItAlPOC1VGG6jUGFKdBpTz9igTwzUAZAcLwaV-18vVI';
const fs = require("fs");
const mediaID = 1;
const mediaIDnotConverted = 2;
const testPreviewImg = "./tests/test-media-preview.png";

const promisify = req =>
  new Promise((resolve, reject) => {
    req.end((error, res) => error ? reject(error) : resolve(res))
  })
;
let status;
const assert = chai.assert;

const tokensArray = [
  {name:'desktop', token: desktopToken},
  {name:'mobile', token: mobileUserToken}
];

const tokens = (test) => {
  tokensArray.forEach(function(tokenObj){
    test(tokenObj)
  });
};
describe('Media API tests', () => {
  tokens((tokenObj) => {

    const status404or403 = tokenObj.name == 'desktop' ? 404 : 403;
    const status200or403 = tokenObj.name == 'desktop' ? 200 : 403;
    const status204or403 = tokenObj.name == 'desktop' ? 204 : 403;

    describe(`As ${tokenObj.name} user test media requests:`, () => {
      describe('GET requests', () => {

        it(`should return status ${status404or403} for invalid media ID`, async () => {
          await server.get('/media/0000')
            .set('authorization', tokenObj.token)
            .expect(status404or403);
        });

        it(`should return status ${status200or403} for valid media ID`, async () => {
          await server.get('/media/' + mediaID)
            .set('authorization', tokenObj.token)
            .expect(status200or403);
        });

        if (tokenObj.name == 'desktop') {
          it('should return valid object', async () => {
            const response = await server.get('/media/' + mediaID)
              .set('authorization', tokenObj.token)
              .expect(200)

            let resObject = response.body;
            let resKeys = Object.keys(resObject);
            assert.includeMembers(resKeys, [
              'id',
              'name',
              'views',
              'downloads',
              'description',
              'links',
              'file',
              'convertedFile',
              'status',
              'type',
              'createdAt',
              'updatedAt',
              'FolderId',
              'like',
              'unlike',
              'dislike',
              'fakeId'
            ]);
          });
        }

        it(`should return ${status404or403} if video is not converted`, async () => {
          await server.get('/media/' + mediaIDnotConverted)
            .set('authorization', tokenObj.token)
            .expect(status404or403);
        });
      });

      describe('PUT requests:', () => {

        var initialMediaObject;
        if (tokenObj.name == 'desktop') {
          before((done) => {
            server.get('/media/' + mediaID)
              .set('authorization', desktopToken)
              .end(function (err, res) {
                if (err) throw err;
                initialMediaObject = res.body;
                done();
              });
          });
;          after(() => {
            var json = {
              description: initialMediaObject.description,
              name: initialMediaObject.name,
              links: initialMediaObject.links
            };
            server.put('/media/' + mediaID)
              .set('content-type', 'application/json')
              .set('authorization', desktopToken)
              .send(JSON.stringify(json));
          });
        }

        it(`should return status ${status404or403} for case with invalid media ID`, async () => {
          server.put('/media/0000')
            .set('content-type', 'application/json')
            .set('authorization', tokenObj.token)
            .send('{"description":"","name":"","links":""}')
            .expect(status404or403);
        });

        it(`should return status ${status204or403} for updated media`, async () => {
          server.put('/media/' + mediaID)
            .set('content-type', 'application/json')
            .set('authorization', tokenObj.token)
            .send('{"description":"test","name":"test","links":"test"}')
            .expect(status204or403);
        });

        if (tokenObj.name == 'desktop') {
          it('check updated properties', async function () {
            var newJson = {
              description: 'description text',
              name: 'name text',
              links: 'links text'
            };
            const response = await promisify(server.put('/media/' + mediaID)
              .set('content-type', 'application/json')
              .set('authorization', desktopToken)
              .send(JSON.stringify(newJson))
              .expect(204));

            const response2 = await promisify(server.get('/media/' + mediaID)
              .set('authorization', desktopToken)
              .expect(200));

            var updated = response2.body;
            assert.equal(newJson.description, updated.description);
            assert.equal(newJson.name, updated.name);
            assert.equal(newJson.links, updated.links);
          });
        }
      });

      describe('POST requests:', function () {
        it.skip(`upload image should return status ${status404or403} for case with invalid media ID (uploads previews to unexciting media)`, async () => {
          await server.post('/media/changeImage?media=0000')
            .set('authorization', desktopToken)
            .attach("file", testPreviewImg)
            .expect(status404or403);
        });

        it.skip('should return 403 if try to update alian image (needs real id)', async () => {
          await server.post('/media/changeImage?media=' + '???')
            .set('authorization', tokenObj.token)
            .attach("file", testPreviewImg)
            .expect(403);
        });

        if (tokenObj.name == 'desktop') {
          it('should update media preview image', async () => {
            this.timeout(10000);

            let post = await promisify(server.post('/media/changeImage?media=' + mediaID)
              .set('authorization', tokenObj.token)
              .attach("file", testPreviewImg)
              .expect(200, "//preview/" + mediaID + ".png"));

            let fileRequest = await promisify(server.get("//preview/" + mediaID + ".png")
              .expect(200));

            let file = fs.readFileSync(testPreviewImg);
            assert.equal(file.equals(fileRequest.body), true);
          });
        }

        if (tokenObj.name == 'mobile') {
          it('should not have access to update media preview image', async () => {
            this.timeout(10000);

            server.post('/media/changeImage?media=' + mediaID)
              .set('authorization', tokenObj.token)
              .attach("file", testPreviewImg)
              .expect(403);
          });
        }
      });
    });
  });
});