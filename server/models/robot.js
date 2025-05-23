const { Site, Robot, Log, SensorLog } = require('../schema/index');
const { Op } = require("sequelize");

class RobotModel {
  // 创建机器人
  static async addRobot(data) {
    return await Robot.create({
      robotname: data.robotname,
      ip: data.ip,
      ptzurl: { h: "", k: "", q: "" },
      robot_type: data.robot_type,
      siteId: data.siteId
    });
  }

  // 获取机器人
  static async getRobot() {
    return await Robot.findAll({
      // where: { status: 1 },
    });
  }

  // 获取所有设备
  static async getRobotAll() {
    return await Robot.findAll({
      where: { status: 1 },
      attributes: ['robotname', 'robot_type', 'id'],
    });
  }

  // 获取单个设备
  static async getSingleRobot(id) {
    return await Robot.findOne({
      include: {
        model: Site,
        attributes: ['id', 'sitename'],
      },
      where: { status: 1, id },
    });
  }
  // 获取设备下的多对多场地
  static async getMultiSite(robotId) {
    return await Robot.findOne({
      include: {
        model: Site,
        attributes: ['id', 'sitename'],
      },
      where: { status: 1, id: robotId },
    });
  }

  // 获取机器人的场地 多对多的话 在一个机器人下面也会获取到多个场地信息
  static async getRobotSite(ip) {
    return await Robot.findAll({
      where: { status: 1, ip },
      //返回的字段为当前所属的场地的siteId，以及该设备可以转移去的所有场地
      attributes: ['siteId', 'robotname', 'robot_type'],
    });
  }

  // 删除任务
  static async deleteRobot(id) {
    // return await Robot.destroy({ where: { id } });
    // 软删除
    return await Robot.update({ status: 0 }, { where: { id } });
  }


  // 更新机器人信息
  static async updateRobot(data) {
    return await Robot.update({
      pvmheight: data.pvmheight || 2278,
      pvmwidth: data.pvmwidth || 1134,
      pvm_thickness: data.pvm_thickness || 30,
      reminder: data.reminder,
      status: data.status,
      cuplength: data.cuplength || 80,
      bridgegap: data.bridgegap || 100,
      video: data.video || 0,
      line_gap: data.line_gap || 50,
      cell_length: data.cell_length || 92.5,
      hole_gap: data.hole_gap || 400,
      pvmedge_hole_gap: data.pvmedge_hole_gap || 25,
      uninstall_z: data.uninstall_z || 0,
      robotname: data.robotname
    }, {
      where: { id: data.id }
    });
  }

  // 创建清扫日志
  static async addLog(data) {
    return await Log.create(data);
  }

  // 获取清扫日志
  static async getLog(siteId) {
    return await Log.findAll({
      where: {
        siteId,
        // time: {
        //   [Op.between]: [new Date(), new Date(new Date() - 24 * 60 * 60 * 1000)]
        // }
      },
      order: [['time', 'DESC']],
      limit: 20,
    });
  }

  // 获取传感器日志
  static async getSensorLog(st, et) {
    return await SensorLog.findAll({
      where: {
        time: {
          [Op.between]: [st, et]
        }
      },
      order: [['time', 'ASC']], // 可选：按时间排序
      // limit: 1000,
    });
  }

}

module.exports = RobotModel;