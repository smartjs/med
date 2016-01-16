module.exports = (sequelize, DataTypes) =>
  sequelize.define('Media', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    unlike: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: DataTypes.TEXT,
    links: DataTypes.TEXT,
    file: DataTypes.STRING,
    convertedFile: DataTypes.STRING,
    status: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('video', 'image', 'text'), // eslint-disable-line new-cap
      allowNull: false,
    },
  }, {
    associate: ({ Media, Comment, Folder }) => {
      Media.belongsTo(Folder);
      Media.hasMany(Comment, { onDelete: 'cascade' });
    },
  })
;
