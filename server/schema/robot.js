module.exports = function (sequelize, DataTypes) {
  const { STRING, INTEGER, DATE, FLOAT } = DataTypes;
  return sequelize.define('robot', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    robotname: { type: STRING, allowNull: false, field: "robotname" },
    robot_type: { type: STRING, defaultValue: 'MMR' },
    ip: { type: STRING, defaultValue: '192.168.147.9' },
    create_time: { type: DATE, defaultValue: DataTypes.NOW },
    update_time: { type: DATE, defaultValue: DataTypes.NOW },
    status: { type: INTEGER, defaultValue: 0 },
    pvmwidth: { type: FLOAT, defaultValue: 1134 },
    pvmheight: { type: FLOAT, defaultValue: 2278 },
    version: { type: STRING, defaultValue: 1 },
    reminder: { type: INTEGER, defaultValue: 20 },
    bridgegap: { type: INTEGER, defaultValue: 100 },
    cuplength: { type: INTEGER, defaultValue: 80 },
    video: { type: INTEGER, defaultValue: 0 },
    line_gap: { type: INTEGER, defaultValue: 50 },
    pvm_thickness: { type: INTEGER, defaultValue: 30 },
    cell_length: { type: FLOAT, defaultValue: 92.5 },
    hole_gap: { type: INTEGER, defaultValue: 400 },
    pvmedge_hole_gap: { type: FLOAT, defaultValue: 25 },
    uninstall_z: { type: INTEGER, defaultValue: 350 },
  }, {
    tableName: 'robot',
    indexes: [
      {
        unique: true,
        fields: ['robotname']
      }
    ]
  });
};
