module.exports = function (sequelize, DataTypes) {
  const { DATE, INTEGER, TEXT } = DataTypes;
  return sequelize.define('diagnostics_agg_save', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, unique: true, },
    create_time: { type: DATE, },
    boots_number: { type: INTEGER, },
    message: { type: TEXT, },
  }, {
    tableName: 'diagnostics_agg_save',
  });
};