const Koa = require('koa');
const cobody = require('co-body');
const db = require('../db');
const co = require('co');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const koaRoute = require('koa-route');
const parse = require('co-busboy');
const createMedia = require("../service/createMediaService");
const saveFile = require("../service/saveFileService");
const app = new Koa();

//fileds
const NAME = "name";
const LINKS = "links";
const DESCRIPTION = "description";
const FOLDER_ID = "FolderId";

app.use(koaRoute.post('/', async (ctx, next) => {
  if (!ctx.request.is('multipart/*')){
    next();
    return;
  }

  var media = { name : '', links:'', description:'' };

  var parts = parse(ctx);
  var part;
  var folderId;

  while (part = await getNextPart(parts)) {
    if (part.length) {
      console.log(part[0]);
      if(FOLDER_ID == part[0]){
        folderId = part[1];
        if(!isThisUserCanWorkWithFolder(folderId, // folder id
            ctx.state.user.id)){
          ctx.throw(403); //return 403 forbidden
          next();
          return;
        }
      } else {
        fillField(ctx, media, part);
      }
    } else {
      var resukt = await saveFile.saveMediaFile(part, media);
      if(!resukt){
        console.log("400 type error");
          ctx.throw(400, 'there\'s not completely data');
          next();
          return;
      }
    }
  }

  try{
    console.log("createMedia.saveMedia(media, folderId)");
    await createMedia.saveMedia(media, folderId);
      console.log("end ");
    ctx.status = 201;
    ctx.body = 'data was added';
  }catch(err){
    console.log("err.message");
    console.log(err.message);
    if(err.message == "data_isnt_full")
      ctx.throw(400, 'there\'s not completely data');

  }
  next();
}));


app.use(koaRoute.get('/:id', async (ctx, mediaId, next) => {
  let media = await db.Media.findOne({where:{id: mediaId}});
  ctx.status = 200;
  ctx.body = (media) ? media : "{}" ;
  next();
}));

function getNextPart(parts){
  return new Promise(ok => {
    parts((err, val) => ok(val))
  });
}

function fillField(ctx, media, part){
  var value = part[1];
  switch (part[0]) {
    case NAME:
     media.name = value;
     break;
    case LINKS:
     media.links = value;
     break;
    case DESCRIPTION:
     media.description = value;
     break;
    case FOLDER_ID:
    default:
  }
}

async function isThisUserCanWorkWithFolder(folderId, userId) {
  var currentFolder = await db.Folder.findOne({where:{id: folderId}});
  var user = await db.User.findOne({where: { id: userId }} );
  if(currentFolder && user){
    return currentFolder.CompanyId == user.CompanyId;
  }
  return false;
}
module.exports = app;
