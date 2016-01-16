module.exports = (sequelize, DataTypes) =>
  sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    login: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    recoveryToken: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM('owner', 'admin', 'operator', 'mobile'), // eslint-disable-line new-cap
      allowNull: false,
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    singleDevice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    associate: ({ User, Company, Folder }) => {
      User.belongsTo(Company);
      User.hasMany(Folder);
    },
  });
