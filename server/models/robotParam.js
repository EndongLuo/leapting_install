const { RobotParam } = require('../schema/index');
const { Op } = require("sequelize");

class RobotParamModel {
  
  /**
   * robotParam初始化检查数据是否存在，不存在则自动添加
   * @param {*} data [{},{}]
   * @returns 
   */
  static async init(data) {
    return await RobotParam.bulkCreate(data, {
        ignoreDuplicates: true, // 关键选项：忽略重复项
    })
    .then(() => {
      return 'robot_param_table 初始化数据检测完成';
    })
    .catch((error) => {
      return 'robot_param_table初始化数据检测异常' + error;
    });
  }

  /**
   * 更新参数
   * @param {*} data 
   */
  static async updateRobotParam(data){
    console.log('updateRobotParam', data);
    const param_name = data.param_name;
    const param_value = data.param_value;
    const default_value = data.default_value;
    return await RobotParam.update({
      param_value: param_value || default_value
    }, {where: {param_name}})
  }

  /**
   * 获取所有param
   * @returns 
   */
  static async getRobotParam() {
    return await RobotParam.findAll();
  }

}

module.exports = RobotParamModel;