var conf = {
  host: process.env.HOST || 'localhost',
  serverPort: process.env.PORT || '3000',
  port: process.env.PORT || '3306',
  dialect: 'mysql',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || 'root',
  dbName: 'node_med',
  logging: console.log,
  secret: 'hdakfniNHBSFKlsajldhskajdhaihw7e78dawgbhdsgi'
};

module.exports = {
  ...conf,
  db: process.env.MARIADB_URL || process.env.MYSQL_URL ||
  `${conf.dialect}://${conf.user}:${conf.password}@${conf.host}:${conf.port}/${conf.dbName}`,
};
