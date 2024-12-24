module.exports = function (sequelize, DataTypes) {
  const { STRING, INTEGER } = DataTypes;
  return sequelize.define('log', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    ip: { type: STRING, },
    device: { type: STRING, },
    level: { type: STRING, },
    time: { type: STRING},
    tag: { type: STRING, },
    msg: { type: STRING, },
    description: { type: STRING, },
    siteId: { type: INTEGER, },
  }, {
    tableName: 'log',
  });
};