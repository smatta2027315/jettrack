const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('promotion', {
    promotionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cadetID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cadet',
        key: 'cadetID'
      }
    },
    new_rank: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    promotion_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'promotion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "promotionID" },
        ]
      },
      {
        name: "cadetID_idx",
        using: "BTREE",
        fields: [
          { name: "cadetID" },
        ]
      },
    ]
  });
};
