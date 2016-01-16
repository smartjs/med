module.exports = (sequelize, DataTypes) =>
  sequelize.define('Company', {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    motd: DataTypes.STRING,
  }, {
    associate: ({ Company, User, Folder }) => {
      Company.hasMany(User);
      Company.hasMany(Folder);
    },
  });
