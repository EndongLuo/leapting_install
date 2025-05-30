module.exports = function (sequelize, DataTypes) {
  const { DATE, INTEGER, FLOAT, BLOB } = DataTypes;
  return sequelize.define('error_data', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    error_id: { type: INTEGER, },
    time: { type: DATE, },
    raw_image: { type: BLOB, },
    dep_time: { type: DATE, },
    dep_image: { type: BLOB, },
    res_time: { type: DATE, },
    res_image: { type: BLOB, },
    line_time1: { type: DATE, },
    yaw_image: { type: BLOB, },
    line_time2: { type: DATE, },
    xy_image: { type: BLOB, },
    hole_time: { type: DATE, },
    hole_image: { type: BLOB, },
    nav_time: { type: DATE, },
    px: { type: FLOAT, },
    py: { type: FLOAT, },
    pz: { type: FLOAT, },
    qx: { type: FLOAT, },
    qy: { type: FLOAT, },
    qz: { type: FLOAT, },
    qw: { type: FLOAT, },
  }, {
    tableName: 'error_data',
  });
};