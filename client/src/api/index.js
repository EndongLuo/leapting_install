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
