module.exports = function (sequelize, DataTypes) {
  const { STRING, INTEGER, DATE, FLOAT } = DataTypes;
  return sequelize.define('robot', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    robotname: { type: STRING, allowNull: false, field: "robotname" },
    robot_type: { type: STRING, },
    ip: { type: STRING, },
    create_time: { type: DATE, defaultValue: DataTypes.NOW },
    update_time: { type: DATE, defaultValue: DataTypes.NOW },
    status: { type: INTEGER, defaultValue: 1 },
    pvmwidth: { type: FLOAT, },
    pvmheight: { type: FLOAT, },
    installgap: { type: FLOAT, },
    version: { type: STRING, },
    reminder: { type: INTEGER, },
    bridgegap: { type: INTEGER, },
    cuplength: { type: INTEGER, },
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
