  
  const RobotParamModel = require('../models/robotParam')

  class RobotParamController{
    
    /**
     * 获取所有 ros param
     * @param {*} ctx 
     */
    static async getRobotParam(ctx) {
        try {
        var res = await RobotParamModel.getRobotParam();
        if (res) {
            console.log('获取 Ros Param 成功');
            ctx.body = { code: 200, msg: '获取 Ros Param 成功', data: res };
        } else {
            ctx.body = { code: 400, msg: '获取 Ros Param 失败' };
        }
        } catch (error) {
        console.error('获取 Ros Param 错误', error);
        ctx.body = { code: 500, msg: '获取 Ros Param 错误' };
        }
    }
    /**
     * 更新ros param
     */
    static async updateRobotParam(ctx) {
        try {
        const data = ctx.request.body;
        const res = await RobotParamModel.updateRobotParam(data);
        if (res) {
            console.log('更新 Ros Param 成功');
            ctx.body = { code: 200, msg: '更新 Ros Param 成功', data: res };
        } else {
            ctx.body = { code: 400, msg: '更新 Ros Param 失败' };
        }
        } catch (error) {
        console.error('更新 Ros Param 失败', error);
        ctx.body = { code: 500, msg: '更新 Ros Param 失败' };
        }
    }
  }

  module.exports = RobotParamController;
  