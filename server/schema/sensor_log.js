module.exports = function (sequelize, DataTypes) {
  const { FLOAT, INTEGER, STRING,DATE } = DataTypes;
  return sequelize.define('sensor_log', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: "id", unique: true, },
    battery_voltage: { type: FLOAT, },
    battery_current: { type: FLOAT, },
    battery_voltage_alarm: { type: FLOAT, },
    battery_percentage: { type: FLOAT, },
    vacuum_pressure: { type: FLOAT, },
    vacuum1_pressure: { type: FLOAT, },
    chassis_voltage: { type: FLOAT, },
    inverter_voltage: { type: FLOAT, },
    overcurrent_alarm: { type: FLOAT, },
    temperature: { type: FLOAT, },
    time: { type: DATE, },
  }, {
    tableName: 'sensor_log',
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['time']
    //   }
    // ]
  });
};
