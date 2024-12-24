const { Site, User, Robot, WindLog } = require('../schema/index')
const { sequelize } = require("../config/db");
const { Op, Sequelize, where } = require('sequelize');

class siteMapModel {
  static baseMap; // 静态属性，用于存储 baseMap
  // 表关系，创建
  static async init(tablename) {
    this.baseMap = require('../schema/baseMap')(sequelize, tablename);
    await this.baseMap.sync(); // force: alter
    // await this.baseMap.sync({ force: true }); // force: alter
    return this.baseMap;
  }
  // 创建场地
  static async createSite(data, userId) {
    const site = await Site.create({
      sitename: data.sitename,
      tablename: data.tablename,
      site_img: data.site_img,
      address: data.address,
      lat_lng: { lng: 0, lat: 0 },
      map: data.map,
      center: data.center,
      blocks: data.blocks,
      P: data.P,
      mapoffset: { to: 0, tx: 0, ty: 0, theta: 0 },
      e_fence: { type: 'FeatureCollection', features: [] },
      zoom: 0,
      data_save: 3,
      transport_height: 0,
      wind_limit: 8,
      total: data.total || { type: 'FeatureCollection', features: [] },
      upright_column: data.upright_column || { type: 'FeatureCollection', features: [] },
    });
    await site.addUser(userId);
    return site;
  }

  // 创建关联关系:场地与机器人
  static async setSiteRobot({ siteId, robotIds }) {
    const site = await Site.findByPk(siteId);
    const robots = await Robot.findAll({
      where: { id: robotIds }
    })
    await site.setRobots(robots);
    return site;
  }

  // 获取场地下的多对多设备
  static async getMultiRobot(id) {
    return await Site.findOne({
      include: {
        model: Robot,
        attributes: ['robotname', 'id'],
      },
      where: { status: 1, id: id },
      attributes: { exclude: ['map', 'upright_column'] },
    });
  }
  // 批量创建地图
  static async createMapBulk(dataArray) {
    return await this.baseMap.bulkCreate(dataArray.map(data => ({
      id: data.id,
      PVMID: data.PVMID,
      sitename: data.sitename,
      block: data.block,
      row: data.row,
      section: data.section,
      num: data.num,
      col: data.col,
      center: data.center,
      zxjnav: data.zxjnav,
      fxjnav: data.fxjnav,
      position: data.position,
      qsnav: data.qsnav,
      pvm_height: 0,
    })));
  }

  // 查询所有场地名称
  static async getSiteName(uid) {
    return await User.findAll({
      where: { id: uid },
      include: {
        model: Site,
        where: { status: 1 },
        // attributes: ['id', 'sitename','tablename'],
        attributes: { exclude: ['map', 'upright_column'] },
      }
    });
  }
  // 获取所有场地名称
  static async getSiteNameAll() {
    return await Site.findAll({
      where: { status: 1, },
      attributes: ['sitename', 'id'],
    });
  }
  //通过id获取场地其他信息
  static async getSiteById(id) {
    return await Site.findAll({
      where: { id },
      attributes: ['sitename', 'id', 'address', 'lat_lng', 'center', 'data_save', 'zoom', 'mapoffset', 'transport_height', 'wind_limit'],
    });
  }
  //通过id获取场地名称
  static async getSiteNameById(id) {
    return await Site.findOne({
      where: { id },
      attributes: ['sitename', 'tablename'],
    });
  }

  // 获取场地信息（地图）
  static async getSiteInfo(id) {
    return await Site.findAll({
      where: { id },
    });
  }

  // 获取场地偏移量
  static async getMapOffset(id) {
    return await Site.findAll({
      where: { id },
      attributes: ['mapoffset', 'tablename'],
    });
  }

  // 获取场地的子阵信息（地图）
  static async getSiteBlock(sitename) {
    return await Site.findAll({
      where: { sitename }
    });
  }

  // 获取场地信息（地图）
  static async getSiteEfence(id) {
    return await Site.findAll({
      where: { id },
      attributes: ['e_fence'],
    });
  }

  // 获取场地立柱（地图）
  static async getUprightColumn(id) {
    return await Site.findAll({
      where: { id },
      attributes: ['upright_column'],
    });
  }

  // 添加场地立柱（地图）
  static async setUprightColumn(id, upright_column) {
    return await Site.update({
      upright_column
    }, {
      where: { id },
    });
  }

  // 更新场地信息（地图）
  static async updateSite(data) {
    return await Site.update({
      sitename: data.sitename,
      address: data.address,
      lat_lng: data.lat_lng,
      center: data.center,
      zoom: data.zoom,
      data_save: data.data_save,
      e_fence: data.e_fence,
      mapoffset: data.mapoffset,
      transport_height: data.transport_height,
      wind_limit: data.wind_limit,
    }, {
      where: { id: data.id }
    });
  }

  // 获取地图
  static async getMap(mapName) {
    this.init(mapName)
    return await this.baseMap.findAll({
      attributes: ['sitename', 'block', 'row', 'section', 'PVMID', 'num', 'center'],
    });
  }

  static async getMapPVMID(mapName, whereClause) {
    this.init(mapName);

    const filteredWhereClause = Object.fromEntries(
      Object.entries(whereClause).filter(([key, value]) => value !== undefined)
    );

    return this.baseMap.findAll({
      where: filteredWhereClause,
      attributes: ['PVMID'],
    });
  }

  // 获取block
  static async getMapBlock(mapName, block) {
    this.init(mapName)
    return await this.baseMap.findAll({
      where: { block },
      attributes: ['PVMID', 'position'],
    });
  }

  // 获取MapDot
  static async getMapDot(data) {
    this.init(data.mapName)
    return await this.baseMap.findAll({
      where: { PVMID: data.PVMIDS },
      attributes: ['position', 'PVMID']
    });
  }

  // 筛选高于行高PVMID
  static async getPVMIDs(id) {
    const { transport_height, tablename, wind_limit } = await Site.findOne({
      where: { id },
      attributes: ['transport_height', 'tablename', 'wind_limit'],
    });
    this.init(tablename)
    const PVMIDs = await this.baseMap.findAll({
      where: { pvm_height: { [Op.gt]: transport_height } },
      attributes: ['PVMID'],
    });
    return { PVMIDs: PVMIDs.map((item) => item.PVMID), tablename, wind_limit };
  }

  // 获取风速日志
  static async getWindLog(id, time) {
    return await WindLog.findAll({
      where: {
        id,
        time: {
          [Op.gt]: time || new Date().getTime() - 24 * 60 * 60 * 1000, // 查询时间大于指定时间
        }
      },
    })
  }

  // 设置风速日志
  static async setWindLog(data) {
    return await WindLog.create({
      wind_speed: data.wind_speed,
      wind_limit: data.wind_limit,
      status: data.status,
      siteId: data.siteId,
    });
  }
}

module.exports = siteMapModel;