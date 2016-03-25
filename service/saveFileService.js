const fs = require("fs");

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

async function saveMediaFile(part, media){
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


module.exports.saveMediaFile = saveMediaFile;
