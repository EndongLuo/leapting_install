module.exports = function (sequelize, DataTypes) {
  const { STRING, INTEGER, DATE, TEXT } = DataTypes;
  return sequelize.define('task', {
    id: { type: INTEGER, primaryKey: true, field: "id" },
    task_name: { type: STRING, allowNull: false, field: "task_name", unique: true },
    nodes: { type: TEXT, },
    done_nodes: { type: TEXT, },
    founder: { type: STRING, },
    recognition_type: { type: STRING, },
    isback: { type: STRING, },
    task_type: { type: STRING, },
    create_time: { type: DATE, defaultValue: DataTypes.NOW },
    update_time: { type: DATE, defaultValue: DataTypes.NOW },
    status: { type: INTEGER, defaultValue: 1}
  }, {
    tableName: 'task',
    indexes: [
      {
        unique: true,
        fields: ['task_name']
      }
    ]
  });
};
