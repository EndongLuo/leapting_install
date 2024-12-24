module.exports = function (sequelize, DataTypes) {
  const { DATE, INTEGER, FLOAT } = DataTypes;
  return sequelize.define('wind_log', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    wind_speed: { type: FLOAT, },
    wind_limit: { type: FLOAT, },
    time: { type: DATE, defaultValue: DataTypes.NOW },
    status: { type: INTEGER, defaultValue: 0},
    siteId: { type: INTEGER, },
  }, {
    tableName: 'wind_log',
  });
};
