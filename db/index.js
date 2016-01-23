const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('./../config');

const client = new Sequelize(config.dbUrl, {logging: console.log});
/*'med', 'root', '', {
  dialect: 'mariadb',
  host: 'localhost',
  port: 3306,
  logging: console.log, // eslint-disable-line no-console
});*/

const models = {};
fs.readdirSync(__dirname + '/models')
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach(file => {
    const model = client.import(path.join(__dirname + '/models', file));
    console.log(path.join(__dirname + '/models', file), model);
    models[model.name] = model;
  });

Object.keys(models).forEach(modelName => {
  if (models[modelName].options.hasOwnProperty('associate')) {
    models[modelName].options.associate(models);
  }
});

module.exports = models;
module.exports.client = client;
