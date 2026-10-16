const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fullstack',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Prefer using generated init-models which sets up associations
let db = {};
try {
  const initModels = require(path.join(__dirname, 'init-models'));
  db = initModels(sequelize);
} catch (err) {
  // fallback: load individual models
  fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, DataTypes);
      db[model.name] = model;
    });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
