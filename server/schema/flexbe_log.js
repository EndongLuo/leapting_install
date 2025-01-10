module.exports = function (sequelize, DataTypes) {
  const { DATE, INTEGER, STRING } = DataTypes;
  return sequelize.define('flexbe_log', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    text: { type: STRING, },
    time: { type: STRING, },
    status_code: { type: INTEGER, defaultValue: 0},
  }, {
    tableName: 'flexbe_log',
  });
};
