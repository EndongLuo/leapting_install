module.exports = function (sequelize, DataTypes) {
  const { STRING, INTEGER, FLOAT} = DataTypes;
  return sequelize.define('pvm_table', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    duration: { type: FLOAT, },
    num: { type: INTEGER, },
    time: { type: STRING},
  }, {
    tableName: 'pvm_table',
  });
};