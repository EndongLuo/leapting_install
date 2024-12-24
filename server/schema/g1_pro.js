module.exports = function (sequelize, DataTypes) {
  const { STRING, INTEGER, JSONB } = DataTypes;
  return sequelize.define('g1_pro', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    from_position: { type: STRING, },
    to_position: { type: STRING, },
    area_position: { type: JSONB, },
    status: { type: INTEGER, defaultValue: 1},
    robotId: { type: INTEGER, },
    cid: { type: INTEGER, },
    bid: { type: INTEGER, },
  }, {
    tableName: 'g1_pro',
  });
};
