const Koa = require('koa');
const cobody = require('co-body');
const db = require('../db');
const co = require('co');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const koaRoute = require('koa-route');
const parse = require('co-busboy');
const fs = require("fs");
const app = new Koa();

//fileds
const NAME = "name";
const LINKS = "links";
const DESCRIPTION = "description";
const FOLDER_ID = "FolderId";

const PATH_TO_FILES = './files/';

const text = ["text/cmd",
"text/css",
"text/csv",
"text/html",
"text/javascript",
"text/plain",
"text/php",
"text/xml"];

const video = ["video/mpeg",
"video/mp4",
"video/ogg",
"video/quicktime",
"video/webm",
"video/x-ms-wmv",
"video/x-flv",
"video/3gpp",
"video/3gpp2"];

const image = ["image/gif",
"image/jpeg",
"image/pjpeg",
"image/png",
"image/svg+xml",
"image/tiff",
"image/vnd.microsoft.icon",
"image/vnd.wap.wbmp"];

app.use(koaRoute.post('/', async (ctx, next) => {
  if (!ctx.request.is('multipart/*')){
    next();
    return;
  }

  var media = {
     name : '',
     links:'',
     description:''
  };

  var parts = parse(ctx);
  var part;
  var folderId;

  while (part = await getNextPart(parts)) {
    if (part.length) {
      console.log(part[0]);
      if(FOLDER_ID == part[0]){
        folderId = part[1];
        if(!isThisUserCanWorkWithFolder(folderId, ctx.state.user.id)){
          //return 403
          ctx.throw(403);
          next();
          return;
        }
      } else {
        fillField(ctx, media, part);
      }
    } else {
      var resukt = await writeFile(ctx, part, media);
      if(!resukt){
        console.log("400 tyhpe error");
          ctx.throw(400, 'there\'s not completely data');
          next();
          return;
      }
    }
  }

  if(!isStructureFull(media) || !folderId){
    if(media.file){//remove file
      fs.unlinkSync(media.file);
    }
    //return 400
    ctx.throw(400, 'there\'s not completely data');
  } else {
    //all good save to db and return 201
    var folder = await db.Folder.findOne({where:{id: folderId}});
    await folder.addMedium(await db.Media.create(media));
    ctx.status = 201;
    ctx.body = 'data was added';
  }
  next();
}));


app.use(koaRoute.get('/:id', async (ctx, mediaId, next) => {
  let media = await db.Media.findOne({where:{id: mediaId}});
  ctx.status = 200;
  if(media){
    ctx.body = media;
  } else {
    ctx.body = "{}";
  }
  next();
}));

function getNextPart(parts){
  return new Promise(ok => {
    parts((err, val) => ok(val))
  });
}

async function writeFile(ctx, part, media){
  var d = new Date();
  var n = d.getTime();
  var pathToFile = PATH_TO_FILES + n;
  media.file = pathToFile;
  var stream = fs.createWriteStream(pathToFile);
  var closeStreamPromise = new Promise(ok => {
      part.on('end', function(){ok()})
  });
  part.pipe(stream);
  await closeStreamPromise;
  var closeMyStreamPromise = new Promise(ok => {
      stream.close(function(){ok()})
  });
  await closeMyStreamPromise;
  var type = getType(part.mime);
  if(!type){
    return false;
  }
  media.type = type;
  return true;
}

function getType(mime){
  if(video.indexOf(mime) > -1){
    return "video";
  } else if(image.indexOf(mime) > -1){
    return "image";
  } else if(text.indexOf(mime) > -1){
    return "text";
  }
  return null;
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
function isStructureFull(media){
    return media.name && media.links && media.file;
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
