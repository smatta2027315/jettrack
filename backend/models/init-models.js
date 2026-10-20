var DataTypes = require("sequelize").DataTypes;
var _award = require("./award");
var _cadet = require("./cadet");
var _event = require("./event");
var _fitnessscore = require("./fitnessscore");
var _promotion = require("./promotion");
var _servicehours = require("./servicehours");
var _user = require("./user");

function initModels(sequelize) {
  var award = _award(sequelize, DataTypes);
  var cadet = _cadet(sequelize, DataTypes);
  var event = _event(sequelize, DataTypes);
  var fitnessscore = _fitnessscore(sequelize, DataTypes);
  var promotion = _promotion(sequelize, DataTypes);
  var servicehours = _servicehours(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  award.belongsTo(cadet, { as: "cadet", foreignKey: "cadetID"});
  cadet.hasMany(award, { as: "awards", foreignKey: "cadetID"});
  fitnessscore.belongsTo(cadet, { as: "FitnessScore", foreignKey: "FitnessScoreID"});
  cadet.hasOne(fitnessscore, { as: "fitnessscore", foreignKey: "FitnessScoreID"});
  promotion.belongsTo(cadet, { as: "cadet", foreignKey: "cadetID"});
  cadet.hasMany(promotion, { as: "promotions", foreignKey: "cadetID"});
  servicehours.belongsTo(cadet, { as: "cadet", foreignKey: "cadetID"});
  cadet.hasMany(servicehours, { as: "servicehours", foreignKey: "cadetID"});
  servicehours.belongsTo(event, { as: "event", foreignKey: "eventID"});
  event.hasMany(servicehours, { as: "servicehours", foreignKey: "eventID"});
  cadet.belongsTo(user, { as: "user", foreignKey: "userID"});
  user.hasMany(cadet, { as: "cadets", foreignKey: "userID"});

  return {
    award,
    cadet,
    event,
    fitnessscore,
    promotion,
    servicehours,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
