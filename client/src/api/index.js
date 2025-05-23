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