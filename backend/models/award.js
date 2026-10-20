const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('award', {
    awardID: {
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
    award_name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    date_awarded: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    award_description: {
      type: DataTypes.STRING(500),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'award',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "awardID" },
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
