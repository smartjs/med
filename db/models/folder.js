module.exports = (sequelize, DataTypes) =>
  sequelize.define('Folder', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    associate: ({ Folder, Company, Media }) => {
      Folder.belongsTo(Company);
      Folder.hasMany(Folder, {
        onDelete: 'cascade',
        as: 'children',
        foreignKey: 'parentId',
        useJunctionTable: false,
      });
      Folder.hasMany(Folder, {
        onDelete: 'cascade',
        as: 'descendants',
        foreignKey: 'rootId',
        useJunctionTable: false,
      });
      Folder.belongsTo(Folder, { as: 'root', foreignKey: 'rootId' });
      Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId' });
      Folder.hasMany(Media, { onDelete: 'cascade' });
    },
  });
