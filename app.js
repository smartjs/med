const debug = require('./debug');

debug.then(() => {
  console.log('done');
}, (e) => {console.log(e);});
