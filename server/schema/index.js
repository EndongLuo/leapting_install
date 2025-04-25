/**
 * 模型关联类
 */

const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const User = require('./user')(sequelize, DataTypes);
const Role = require('./role')(sequelize, DataTypes);
const Site = require('./site')(sequelize, DataTypes);
const Robot = require('./robot')(sequelize, DataTypes);
const Task = require('./task')(sequelize, DataTypes);
const TaskInfo = require('./taskinfo')(sequelize, DataTypes);
const TimedTask = require('./timedtask')(sequelize, DataTypes);
const Permission = require('./permission')(sequelize, DataTypes);
const Log = require('./log')(sequelize, DataTypes);
const G1_pro = require('./g1_pro')(sequelize, DataTypes);
const FlexbeLog = require('./flexbe_log')(sequelize, DataTypes);
const SensorLog = require('./sensor_log')(sequelize, DataTypes);


//建立模型之间关联关系

// 用户与角色：一个用户一个角色，一个角色可由多个用户使用
User.belongsTo(Role);
Role.hasMany(User);

// 角色与权限：一个角色有多个权限，一个权限可由多个角色使用
Role.belongsToMany(Permission, { through: 'role_permission' });
Permission.belongsToMany(Role, { through: 'role_permission' });

// 用户与场地：一个用户有多个场地，一个场地可由多个用户使用
User.belongsToMany(Site, { through: 'user_site' });
Site.belongsToMany(User, { through: 'user_site' });

// 场地与机器人：一个场地有多台机器人，并且一台机器人可以属于多个场地
// 直接用  Robot.hasMany(Site); 可以吗？
Robot.belongsToMany(Site, { through: 'robot_site' });
Site.belongsToMany(Robot, { through: 'robot_site' });
// Robot.belongsTo(Site);
// Site.hasMany(Robot);

// 机器人与任务：一台机器人可有多个任务，一个任务也可有多台机器人执行
Robot.hasMany(Task);
Task.belongsTo(Robot);

// 任务信息与任务：一个任务可有多个实时任务，一个实时任务只有一个任务模版执行
Task.hasMany(TaskInfo, { onDelete: 'CASCADE' });
TaskInfo.belongsTo(Task);

// 定时任务与任务：一个任务可有多个定时任务，一个定时任务只有一个任务模版执行
Task.hasMany(TimedTask, { onDelete: 'CASCADE' });
TimedTask.belongsTo(Task);

// // 场地与风速日志：一个场地有多个风速日志，一个风速日志只有一个场地
// Site.hasMany(FlexbeLog);
// FlexbeLog.belongsTo(Site);


//创建表
// sequelize.sync({ force: true });  
// sequelize.sync({ alter: true });
sequelize.sync();

SensorLog.sync({ alter: true }) 

module.exports = {
  User, Role, Site, Task, TimedTask, TaskInfo, Robot, G1_pro, Log, FlexbeLog, SensorLog
}