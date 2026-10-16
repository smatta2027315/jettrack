const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    firstname: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
