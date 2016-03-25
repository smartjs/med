const db = require('../db');
const fs = require("fs");

// media - structure which has to be saved
//folderId - if of folder where media has to be
async function saveMedia(media, folderId){
  if(!isStructureFull(media) || !folderId){
      if(media.file){//remove file
        fs.unlinkSync(media.file);
      }
      console.log("saveMedia throw error");
      throw{message:"data_isnt_full"};
      return;
      //return 400
      // ctx.throw(400, 'there\'s not completely data');
  }


    //all good save to db and return 201
    var folder = await db.Folder.findOne({where:{id: folderId}});
    console.log("receive folder id");
    await folder.addMedium(await db.Media.create(media));
    console.log("saved media");
    return true;
}


function isStructureFull(media){
    return media.name && media.links && media.file;
}


module.exports.saveMedia = saveMedia;
