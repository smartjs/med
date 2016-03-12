require('babel-register');
const config = require('./config');
const app = require('./app');

app
    .then(app => {
    app.listen(config.port);
    })
    .catch (err => {
       throw err;
    });

