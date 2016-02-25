const db = require('./db');
const co = require('co');
const bcrypt = require('bcrypt-nodejs');

module.exports = new Promise (function(resolved, rejected){
  try {
    co(function* makeDebug() {
      /*  if (!process.env.DEBUG) {
       return;
       }*/
      yield db.client.query('SET FOREIGN_KEY_CHECKS = 0');
      yield db.client.sync({ force: true });
      yield db.client.query('SET FOREIGN_KEY_CHECKS = 1');

      const company = yield db.Company.create({
        name: 'Test',
      });

      const user = db.User.build({
        name: 'Demo user',
        login: 'demo',
        token: '',
        email: 'demo@demo.me',
        password: bcrypt.hashSync('demo'),
        type: 'admin',
        deviceId: '',
        singleDevice: false,
      });

      const user2 = db.User.build({
        name: 'Demo user2',
        login: 'demo2',
        token: '',
        email: 'demo2@mailinator.com',
        password: bcrypt.hashSync('demo2'),
        type: 'operator',
      });

      const user3 = db.User.build({
        name: 'Demo user3',
        login: 'demo3',
        token: '',
        phone: '+380504020799',
        password: bcrypt.hashSync('demo3'),
        type: 'mobile',
      });


      const library1 = yield db.Folder.create({ name: 'Lib1' });
      const library2 = yield db.Folder.create({ name: 'Lib2' });
      const library3 = yield db.Folder.create({ name: 'Lib3' });

      yield user.save();
      yield user2.save();
      yield user3.save();
      yield company.addFolder(library1);
      yield company.addFolder(library2);
      yield company.addFolder(library3);
      yield company.addUser(user);
      yield company.addUser(user2);

      yield company.addUser(user3);
      const folder1 = yield db.Folder.create({ name: 'Folder1' });
      const folder2 = yield db.Folder.create({ name: 'Folder2' });
      const folder3 = yield db.Folder.create({ name: 'Folder3' });
      const folder11 = yield db.Folder.create({ name: 'Folder11' });
      yield library1.addChildren(folder1);
      yield library1.addChildren(folder2);
      yield library1.addChildren(folder3);
      yield library1.addChildren(folder11);
      yield folder1.addChildren(folder11);
      const media1 = yield db.Media.create({
        name: 'Media1',
        views: 10,
        description: 'Example Media1',
        links: 'fooo',
        file: '/tmp/thai.mp4',
        type: 'video',
      });

      const comment1 = yield db.Comment.create({
        text: 'Test comment 1',
        author: 'qwerty1',
        date: '20.09.2014',
      });

      const comment2 = yield db.Comment.create({
        text: 'Test comment 2',
        author: 'qwerty2',
        date: '22.09.2014',
      });

      const comment3 = yield db.Comment.create({
        text: 'Test answer on comment 2',
        author: 'qwerty2',
        date: '22.09.2014',
      });

      const comment4 = yield db.Comment.create({
        text: 'Test answer on comment 2',
        author: 'Demo user',
        date: '22.09.2014',
      });

      const comment5 = yield db.Comment.create({
        text: 'Test comment 3',
        author: 'qwerty2',
        date: '22.09.2014',
      });

      yield comment2.addChildren(comment3);
      yield comment2.addChildren(comment4);

      const media2 = yield db.Media.create({
        name: 'Media2',
        views: 17,
        description: 'Example Media2',
        links: 'bar',
        type: 'video',
      });

      const media3 = yield db.Media.create({
        name: 'Media3',
        views: 17,
        type: 'video',
      });


      yield library1.addMedium(media1);
      yield media2.addComment(comment1);
      yield media3.addComment(comment2);
      yield media3.addComment(comment3);
      yield media3.addComment(comment4);
      yield media3.addComment(comment5);
      yield library1.addMedium(media2);
      yield folder11.addMedium(media3);
      yield library1.addMedium(media3);

      console.log('All debug done'); // eslint-disable-line no-console
      resolved();
    });
  } catch (e) {
    rejected(e);
  }
});