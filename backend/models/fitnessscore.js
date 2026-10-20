const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('fitnessscore', {
    FitnessScoreID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'cadet',
        key: 'cadetID'
      }
    },
    cadetID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assessment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    push_ups: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sit_ups: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mile_run: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'fitnessscore',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "FitnessScoreID" },
        ]
      },
    ]
  });
};
