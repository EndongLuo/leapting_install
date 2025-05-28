const RobotModel = require('../models/robot');

class RobotController {
  /**
   * 获取机器人
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getRobot(ctx) {
    try {
      // const { siteId } = ctx.query;

      var res = await RobotModel.getRobot();
      if (res) {
        console.log('获取机器人成功');
        ctx.body = { code: 200, msg: '获取机器人成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '获取机器人失败' };
      }
    } catch (error) {
      console.error('获取机器人错误', error);
      ctx.body = { code: 500, msg: '获取机器人错误' };
    }
  }

  /**
   * 获取所有机器人
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getRobotAll(ctx) {
    try {
      //console.log(11111);

      var res = await RobotModel.getRobotAll();
      //console.log('------------robot--------------', res);

      if (res) {
        console.log('获取机器人成功');
        ctx.body = { code: 200, msg: '获取机器人成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '获取机器人失败' };
      }
    } catch (error) {
      console.error('获取机器人错误', error);
      ctx.body = { code: 500, msg: '获取机器人错误' };
    }
  }
  /**
   * 获取机器人
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getSingleRobot(ctx) {
    try {
      const { id } = ctx.query;
      var res = await RobotModel.getSingleRobot(id);
      //console.log('+++++++++++res++++++++++++', res[0]);

      if (res) {
        console.log('获取机器人成功');
        ctx.body = { code: 200, msg: '获取机器人成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '获取机器人失败' };
      }
    } catch (error) {
      console.error('获取机器人错误', error);
      ctx.body = { code: 500, msg: '获取机器人错误' };
    }
  }
  /**
   * 获取机器人
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getMultiSite(ctx) {
    try {
      const { siteId } = ctx.query;
      // console.log(siteId);

      var res = await RobotModel.getMultiSite(siteId);
      //console.log('+++++++++++res++++++++++++', res);

      if (res) {
        console.log('获取机器人成功');
        ctx.body = { code: 200, msg: '获取机器人成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '获取机器人失败' };
      }
    } catch (error) {
      console.error('获取机器人错误', error);
      ctx.body = { code: 500, msg: '获取机器人错误' };
    }
  }

  /**
   * 修改机器人
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async updateRobot(ctx) {
    try {
      const data = ctx.request.body;
      const res = await RobotModel.updateRobot(data);
      // console.log('new robot------------',data);
      if (res) {
        console.log('更新机器人成功');
        ctx.body = { code: 200, msg: '更新机器人成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '更新机器人失败' };
      }
    } catch (error) {
      console.error('更新机器人失败', error);
      ctx.body = { code: 500, msg: '更新机器人失败' };
    }
  }


  /**
   * 添加机器人
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async addRobot(ctx) {
    try {
      const data = ctx.request.body;
      const res = await RobotModel.addRobot(data);

      if (res) {
        console.log('添加机器人成功');
        ctx.body = { code: 200, msg: '添加机器人成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '添加机器人失败' };
      }
    } catch (error) {
      console.error('添加机器人失败', error);
      ctx.body = { code: 500, msg: '添加机器人失败' };
    }
  }


  /**
* 删除机器人
* @param ctx
* @returns {Promise.<void>}
*/
  static async deleteRobot(ctx) {
    try {
      const id = ctx.query.id;
      const res = await RobotModel.deleteRobot(id);

      if (res) {
        console.log('删除机器人成功');
        ctx.body = { code: 200, msg: '删除机器人成功' };
      } else {
        ctx.body = { code: 400, msg: '删除机器人失败' };
      }
    } catch (error) {
      console.error('删除机器人错误', error);
      ctx.body = { code: 500, msg: '删除机器人错误' };
    }
  }

  /*
* 获取日志
*/
  static async getLog(ctx) {
    try {
      const siteId = ctx.query.siteId;

      var res = await RobotModel.getLog(siteId);
      // console.log('siteId', siteId,'res=',res);
      if (res) {
        console.log('获取日志成功');
        ctx.body = { code: 200, msg: '获取日志成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '获取日志失败' };
      }
    } catch (error) {
      console.error('获取日志错误', error);
    }
  }

  /**
   * 获取传感器日志
   * @param ctx
   * @returns {Promise.<void>}
   *  */
  static async getSensorLog(ctx) {
    try {
      const { st, et } = ctx.request.body;

      var res = await RobotModel.getSensorLog(Number(st), Number(et));
      console.log('getSensorLog', 'res=', res.length);
      if (res) {
        console.log('获取传感器日志成功');
        ctx.body = { code: 200, msg: '获取传感器日志成功', data: res };
      } else {
        ctx.body = { code: 400, msg: '获取传感器日志失败' };
      }
    } catch (error) {
      console.error('获取传感器日志错误', error);
    }
  }

  
  /**
   * 创建任务信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async setLog(ctx) {
    try {
      const data = ctx.request.body;
      console.log('addlog', data);
      const res = await RobotModel.addLog(data);

      if (res) {
        // console.log(res);
        console.log("添加上位机操作记录成功");
        ctx.body = {
          code: 200,
          msg: "创建上位机操作记录成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "创建上位机操作记录失败",
        };
      }
    } catch (error) {
      console.error("创建上位机操作记录错误", error);
      ctx.body = {
        code: 500,
        msg: "创建上位机操作记录错误",
      };
    }
  }

}

module.exports = RobotController;
