const { request } = require('@/utils/request');

/**
 * @description 获取机器人
 * @returns {Object}
 */
export const getRobot = () => request.get(`/robot/robot`);

/**
 * @description 修改机器人
 * @returns {Object}
 */
export const updateRobot = data => request.put(`/robot/robot`, data);

/**
 * @description 获取传感器日志
 * @returns {Object}
 */
export const getSensorLog = data => request.post(`/robot/sensorlog`, data);


/**
 * @description 添加任务信息
 * @returns {Object}
 */
export const setTaskInfo = data => request.post(`/task/taskinfo`, data);

/**
 * @description 获取安装历史速率
 * @returns {Object}
 */
export const getHistorySpeed = id => request.get(`/task/historyspeed?id=${id}`);

/**
 * @description 添加上位机行为操作记录
 * @returns {Object}
 */
export const setLog = data => request.post(`/robot/log`, data);

/**
 * @description 添加上位机行为操作记录
 * @returns {Object}
 */
export const getLog = data => request.get(`/robot/log`, data);

/**
 * @description更新ROS Param
 * @param {*} data 
 * @returns 
 */
export const updateRobotParam = data => request.put(`/robot/RobotParam`, data);

/**
 * @description 获取robot_param—表格数据
 * @returns 
 */
export const getRobotParam = () => request.get(`/robot/RobotParam`);

/**
 * @description 获取诊断数据存储表 开机次数集合
 * @returns Array 
 */
export const getBootsNumList = () => request.get(`/log/getBootsNumList`);

/**
 * @description 获取诊断数据存储表 选定时间段内msg
 * @returns Array 
 */
export const getMessages = data => request.post(`/log/getMessages`, data);
