require('babel-register');
var app = require('./app');
const configs = require('./configindex.js');
app.listen(configs.PORT);
