var request = require('supertest');
var expect = require('chai').expect;
require('../helper');

const FOLDER_ID = 1;
const NAME = 'Kittie';
const LINKS = 'Links here';
const DESCRIPTION = 'Description here';
const FILE = './test/cross.png';

//create data states
var CreateStubState = {
  ALL_DATA: {value: 0},
  NO_NAME: {value: 1},
  NO_LINKS: {value: 2},
  NO_FILE: {value: 3},
  NO_DESCRIPTION: {value: 4},
  NO_FOLDER_ID: {value: 5},
  TRASH_IN_FILE: {value: 6},
  NO_TOKEN: {value: 7},
};

const ALL_DATA = 0;
const WRONG_NAME = 1;
const request = request('http://localhost:3000');
var token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaWF0IjoxNDU3ODcwMjg1LCJleHAiOjE0NTc5NTY2ODV9.jstsowg9q_n3jvrJc5KOaA-s5LY9aYcDfmZoGlYZ8ZU';
var oldMedias, newMedias;

const promisify = req => new Promise((resolve, reject) =>
  req.end((error, res) => {
    return error ? reject(error) : resolve(res);
  }));

describe('create media ', function() {
  it('with full correct data', async function(done) {
    console.log("get all media");
    oldMedias = await promisify(getAllMedia());
    console.log("createNewMedia");
    await promisify(createNewMedia(CreateStubState.ALL_DATA));
    console.log("get all media");
    newMedias = await promisify(getAllMedia());
    console.log("getNewItem");
    var newItem = getNewItem();

    expect(newItem).to.not.equal(null);

    console.log(newItem);
    var item = await promisify(loadFullItemData(newItem.id));

    console.log(item.body);
    expect(item.body.name).to.be.equal(NAME);
    expect(item.body.description).to.be.equal(DESCRIPTION);
    expect(item.body.links).to.be.equal(LINKS);
    console.log("CREATING SUCCESS");
  });

  it('with wrong file name', async function(done) {
    await promisify(createNewMedia(CreateStubState.NO_NAME));
  });
  it('without links', async function(done) {
    await promisify(createNewMedia(CreateStubState.NO_LINKS));
  });
  it('without file', async function(done) {
    await promisify(createNewMedia(CreateStubState.NO_FILE));
  });
  it('without description', async function(done) {
    await promisify(createNewMedia(CreateStubState.NO_DESCRIPTION));
  });
  it('without folder id', async function(done) {
    await promisify(createNewMedia(CreateStubState.NO_FOLDER_ID));
  });
  it('with wrong token', async function(done) {
    await promisify(request.post('/api/media').expect(401));
  });
  it('with trash in file', async function(done) {
    await promisify(createNewMedia(CreateStubState.TRASH_IN_FILE));
  });
  it('without token', async function(done) {
    await promisify(createNewMedia(CreateStubState.NO_TOKEN));
  });
});


function createNewMedia(state) {
  var createdRequest = request.post('/api/media')
  if(CreateStubState.NO_TOKEN != state){
    createdRequest.set('authorization', token);
  }
  if(CreateStubState.NO_NAME != state){
    createdRequest.field('name', NAME)
  }
  if(CreateStubState.NO_FILE != state && CreateStubState.TRASH_IN_FILE != state){
    createdRequest.attach('file', FILE)
  } else if(CreateStubState.TRASH_IN_FILE == state){
    createdRequest.field('file', FILE)
  }
  if(CreateStubState.NO_LINKS != state){
    createdRequest.field('links', LINKS)
  }
  if(CreateStubState.NO_FOLDER_ID != state){
    createdRequest.field('FolderId', FOLDER_ID)
    if(CreateStubState.WRONG_FOLDER_ID != state){
      createdRequest.field('FolderId', FOLDER_ID)
    }
  }
  if(CreateStubState.NO_DESCRIPTION != state){
    createdRequest.field('description', DESCRIPTION)
  }
  if(CreateStubState.ALL_DATA == state || CreateStubState.NO_DESCRIPTION == state){
    createdRequest.expect(201);
  } else if(CreateStubState.NO_TOKEN == state) {
    createdRequest.expect(401);
  } else {
    createdRequest.expect(400);
  }
  return createdRequest;
}

function getAllMedia(done, isNewMedias) {
  return request.get('/api/folders/' + FOLDER_ID)
    .set('authorization', token)
    .expect(200);
}

function loadFullItemData(id){
  return request.get('/api/media/' + id)
    .set('authorization', token)
    .expect(200);
}

function getNewItem(){
  var newMediaObj = newMedias.body.data;
  var oldMediaObj= oldMedias.body.data;

  var found;
  for(var i = 0; i < newMediaObj.length; i++)
  {
    found = false;
    var newItem = newMediaObj[i];
    for(var j = 0; j < oldMediaObj.length; j++){
      if(oldMediaObj[j].id == newItem.id){
        found = true;
        break;
      }
    }
    if(!found){
      return newItem;
    }
  }
  return null;
}
