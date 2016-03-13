module.exports = (sequelize, DataTypes) =>
  sequelize.define('Comment', {
    text: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true,
      },
    },
    author: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
    date: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
  }, {
    associate: ({ Comment, Media }) => {
      Comment.belongsTo(Media);
      Comment.hasMany(Comment, {
        onDelete: 'cascade',
        as: 'children',
        foreignKey: 'parentId',
        useJunctionTable: false,
      });
      Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
    },
  })
;
