const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('servicehours', {
    servicehoursID: {
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
    eventID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'event',
        key: 'eventID'
      }
    },
    hours: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false
    },
    service_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'servicehours',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicehoursID" },
        ]
      },
      {
        name: "cadetID_idx",
        using: "BTREE",
        fields: [
          { name: "cadetID" },
        ]
      },
      {
        name: "fk_eventid_idx",
        using: "BTREE",
        fields: [
          { name: "eventID" },
        ]
      },
    ]
  });
};
