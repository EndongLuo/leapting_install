module.exports = function (sequelize, DataTypes) {
  const { STRING, INTEGER } = DataTypes;
  return sequelize.define('robot_param', {
    id: { type: INTEGER, allowNull: false, primaryKey: true },
    param_name: { type: STRING, allowNull: false, unique: true },
    param_type: { type: STRING, allowNull: false },
    param_value: { type: STRING, allowNull: false },
    param_class: { type: STRING, allowNull: false },
    param_description: { type: STRING, allowNull: false }
  }, {
    tableName: 'robot_param',
  });
};
