require('babel-register');
const config = require('./config');
const app = require('./app');
app.listen(config.serverPort);
