var conf = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || '3306',
  dialect: 'mariadb',
  user: process.env.USER,
  password: process.env.PASSWORD,
  dbName: 'med',
  logging: console.log,
};

module.exports = {
  ...conf,
  db: process.env.MARIADB_URL || process.env.MYSQL_URL ||
  `${conf.dialect}://${conf.user}:${conf.password}@${conf.host}:${conf.port}/${conf.dbName}`,
};
