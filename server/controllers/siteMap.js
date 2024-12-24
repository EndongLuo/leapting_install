const siteMapModel = require("../models/siteMap");
const { dxf2geojson } = require("../utils/dxf2geojson");
const arrayToTree = require("../utils/arrayToTree");
const fs = require("fs");
const util = require("util");
const path = require("path");
let tree = [];

// 使用util.promisify将fs.unlink转换为返回Promise的函数，便于使用async/await
const unlinkAsync = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);

class siteMapController {
  /**
   * 创建场地地图
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async setSiteMap(ctx) {
    try {
      const req = ctx.request.body;

      console.log(req);

      const file = req.fileName.split('/');
      const files = file.reduce((acc, item) => {
        if (item.includes('_all')) acc.all = item;
        else if (item.includes('_lz')) acc.lz = item;
        else {
          acc.map = item;
          acc.tablename = 'map_' + item.split('.dxf')[0];
        }
        return acc;
      }, {});

      req.tablename = files.tablename;
      var table = req.tablename;
      var diff;
      if (Number(req.toward)) diff = req.Yspacing;
      else diff = req.Xspacing;
      const dxf2geojsonPromise = dxf2geojson(1, files.map, req.P, req.toward, diff);

      const initTablePromise = siteMapModel.init(req.tablename);

      const res = await dxf2geojsonPromise;
      req.map = res.geojsons;
      req.blocks = res.blocks;
      req.center = res.mapCenter;

      if (files.all) req.total = await dxf2geojson(0, files.all);
      if (files.lz) req.upright_column = await dxf2geojson(0, files.lz);

      const userId = ctx.state.user.user_id;
      const siteResPromise = siteMapModel.createSite(req, userId);

      const Yspacing = req.Yspacing / 2;
      const Xspacing = req.Xspacing / 2;

      const createMapRequests = res.flatArr.map((i) => {
        let obj = { ...i, sitename: req.sitename };

        // 固定支架
        if (!Number(req.toward)) {
          obj.qsnav = [i.center[0], i.center[1] + 1.3];
          obj.zxjnav = [i.center[0], i.center[1] - Yspacing];
          obj.fxjnav = [i.center[0], i.center[1] + Yspacing];
        } else {
          obj.qsnav = [i.center[0] - 1.3, i.center[1]];
          obj.zxjnav = [i.center[0] - Xspacing, i.center[1]];
          obj.fxjnav = [i.center[0] + Xspacing, i.center[1]];
        }
        return obj;
      });

      await initTablePromise;
      await siteMapModel.createMapBulk(createMapRequests);
      const siteRes = await siteResPromise;

      if (siteRes) ctx.body = { code: 200, msg: "创建场地成功", data: { table } };
      else ctx.body = { code: 400, msg: "创建场地失败" };

      // 删除DXF文件
      file.forEach(async (item) => {
        const filePath = path.join(__dirname, '../public/uploads/DXF/', item);
        await unlinkAsync(filePath).catch((error) => {
          console.error('删除DXF文件失败', error);
        });
      })

    } catch (error) {
      console.error("创建场地地图错误", error);
      ctx.body = { code: 500, msg: "创建场地地图错误" };
    }
  }

  /**
   * 创建关联关系:场地与机器人
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async setSiteRobot(ctx) {
    const { data } = ctx.request.body;

    const res = await siteMapModel.setSiteRobot(data);

    if (res) {
      ctx.body = {
        code: 200,
        msg: "设置场地设备成功",
      };
    } else {
      ctx.body = {
        code: 400,
        msg: "设置场地设备失败",
      };
    }
  }
  catch(error) {
    console.error("设置场地设备失败", error);
    ctx.body = {
      code: 500,
      msg: "设置场地设备失败",
    };
  }

  /**
   * 获取所有场地名称
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getSiteName(ctx) {
    try {
      const { uid } = ctx.request.body;
      // console.log(uid);
      const res = await siteMapModel.getSiteName(uid);
      if (res) {
        ctx.body = {
          code: 200,
          msg: "获取所有场地名称成功",
          data: [...res[0].sites],
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取所有场地名称失败",
        };
      }
    } catch (error) {
      console.error("获取所有场地名称错误", error);
      ctx.body = {
        code: 500,
        msg: "获取所有场地名称错误",
      };
    }
  }
  /**
   * 获取所有场地名称
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getSiteNameAll(ctx) {
    try {
      const res = await siteMapModel.getSiteNameAll();
      //console.log('7777777',res.sitename);
      if (res) {
        ctx.body = {
          code: 200,
          msg: "获取场地名称成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取场地名称失败",
        };
      }
    } catch (error) {
      console.error("获取场地名称错误", error);
      ctx.body = {
        code: 500,
        msg: "获取场地名称错误",
      };
    }
  }

  /**
  * 获取场地下的多个设备
  * @param ctx
  * @returns {Promise.<void>}
  */
  static async getMultiRobot(ctx) {
    try {
      const { id } = ctx.request.body;

      const res = await siteMapModel.getMultiRobot(id);
      if (res) {
        ctx.body = {
          code: 200,
          msg: "获取场地名称成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取场地名称失败",
        };
      }
    } catch (error) {
      console.error("获取场地名称错误", error);
      ctx.body = {
        code: 500,
        msg: "获取场地名称错误",
      };
    }
  }

  /**
   * 只获取场地名称
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getSiteNameById(ctx) {
    try {
      const { id } = ctx.request.body;
      const res = await siteMapModel.getSiteNameById(id);
      if (res) {
        ctx.body = {
          code: 200,
          msg: "获取场地名称成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取场地名称失败",
        };
      }
    } catch (error) {
      console.error("获取场地名称错误", error);
      ctx.body = {
        code: 500,
        msg: "获取场地名称错误",
      };
    }
  }

  /**
   * 只获取场地名称
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getSiteById(ctx) {
    try {
      const { id } = ctx.request.body;
      // console.log(uid);
      const res = await siteMapModel.getSiteById(id);
      // console.log("==========site=========", res);
      if (res) {
        ctx.body = {
          code: 200,
          msg: "获取场地名称成功",
          data: res[0],
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取场地名称失败",
        };
      }
    } catch (error) {
      console.error("获取场地名称错误", error);
      ctx.body = {
        code: 500,
        msg: "获取场地名称错误",
      };
    }
  }

  /**
   * 获取场地信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getSiteInfo(ctx) {
    try {
      let res = null;
      const req = ctx.request.body;
      if (req.id) {
        res = await siteMapModel.getSiteInfo(req.id);
        // console.log(req.block,res[0].map[req.block]);
        res[0].map = res[0].map[req.block || "All"];
      }
      // else if (req.sitename) res = await siteMapModel.getSiteBlock(req.sitename);

      if (res) ctx.body = { code: 200, msg: "获取场地信息成功", data: res[0] };
      else ctx.body = { code: 400, msg: "获取场地信息失败" };
    } catch (error) {
      console.error("获取场地信息错误", error);
      ctx.body = { code: 500, msg: "获取场地信息错误" };
    }
  }

  /**
   * 更新场地信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async updateSite(ctx) {
    try {
      const data = ctx.request.body;
      // console.log(data);
      if (data.e_fence) {
        console.log("更新场地信息-电子围栏", data.e_fence);
      }
      var res = await siteMapModel.updateSite(data);

      if (res) {
        console.log("更新场地信息成功");
        ctx.body = { code: 200, msg: "更新场地信息成功", data: res };
      } else ctx.body = { code: 400, msg: "更新场地信息失败" };
    } catch (error) {
      console.error("更新场地信息错误", error);
      ctx.body = { code: 500, msg: "更新场地信息错误" };
    }
  }

  /**
   * 获取mapTree
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getMapTree(ctx) {
    try {
      const { name, id, label, treeId } = ctx.request.body;
      // console.log("label", label, "treeId", treeId);
      if (!tree[name]) {
        const res = await siteMapModel.getMap(name);
        tree[name] = arrayToTree(res);
      }

      const filteredData = newTree(tree[name], label, treeId);
      // console.log(filteredData);

      // // 并行获取多个场地信息
      // const names = name.split(',');
      // const siteMaps = await Promise.all(names.map(n => siteMapModel.getMap(n)));
      // const results = siteMaps.flat(); // 将所有结果合并到一个数组中

      // // 获取电子围栏
      // const [{ dataValues: { e_fence: { features } } }] = await siteMapModel.getSiteEfence(id);
      // const fences = features.map(i => i.geometry.coordinates[0]);

      // // 过滤掉在任何电子围栏内的点
      // const Points = results.filter(point => !fences.some(fence => isPointInPolygon(point.center, fence)));

      // if (Points.length) {
      if (filteredData.length) {
        // var tree = arrayToTree(Points);
        ctx.body = { code: 200, msg: "获取mapTree成功", data: filteredData };
      } else ctx.body = { code: 400, msg: "获取mapTree失败" };
    } catch (error) {
      console.error("获取mapTree错误", error);
      ctx.body = { code: 500, msg: "获取mapTree错误" };
    }
  }

  /**
   * 获取立柱
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getUprightColumn(ctx) {
    try {
      const { id, block } = ctx.request.body;
      // console.log('block', block);
      // const filePath = path.join(__dirname, '../public/uploads/DXF/4S_lz.json');
      // const data = await readFile(filePath, 'utf8');
      // const jsonData = JSON.parse(data);
      // // console.log(jsonData);

      // const q = await siteMapModel.setUprightColumn(id, jsonData);
      // console.log(q);

      // 获取立柱
      const res = await siteMapModel.getUprightColumn(id);
      const features = res[0].upright_column.features;

      // 过滤掉不在指定block内的立柱
      const filteredFeatures = features.filter(
        (feature) => feature.properties.layer === block
      );
      res[0].upright_column.features = filteredFeatures;
      // console.log(res[0].upright_column.features.length);

      if (res.length) {
        ctx.body = { code: 200, msg: "获取UprightColumn成功", data: res };
      } else ctx.body = { code: 400, msg: "获取UprightColumn失败" };
    } catch (error) {
      console.error("获取UprightColumn错误", error);
      ctx.body = { code: 500, msg: "获取UprightColumn错误" };
    }
  }

  /**
   * 获取mapBlock
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getMapBlock(ctx) {
    try {
      const { name, block } = ctx.request.body;

      // 获取电子围栏
      const res = await siteMapModel.getMapBlock(name, block);
      // console.log(res);

      if (res.length) {
        // var tree = arrayToTree(Points);
        ctx.body = { code: 200, msg: "获取mapTree成功", data: res };
      } else ctx.body = { code: 400, msg: "获取mapTree失败" };
    } catch (error) {
      console.error("获取mapTree错误", error);
      ctx.body = { code: 500, msg: "获取mapTree错误" };
    }
  }

  /**
   * 获取getMapDot
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getMapDot(ctx) {
    try {
      const data = ctx.request.body;
      data.PVMIDS = data.PVMIDS.split(",");
      // console.log(data.PVMIDS);
      const res = await siteMapModel.getMapDot(data);
      res.forEach((i) => {
        i.position = JSON.parse(i.position);
      });
      if (res) {
        // console.log('getMapDot',res);
        ctx.body = {
          code: 200,
          msg: "获取成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取失败",
        };
      }
    } catch (error) {
      console.error("获取getMapDot错误", error);
      ctx.body = {
        code: 500,
        msg: "获取getMapDot错误",
      };
    }
  }

  /**
   * 设置风速日志
   * @param ctx
   * @returns {Promise.<void>}
   * */
  static async setWindLog(ctx) {
    try {
      const { data } = ctx.request.body;
      const res = await siteMapModel.setWindLog(data);
      if (res) {
        ctx.body = {
          code: 200,
          msg: "设置风速日志成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "设置风速日志失败",
        };
      }
    } catch (error) {
      console.error("设置风速日志错误", error);
      ctx.body = {
        code: 500,
        msg: "设置风速日志错误",
      };
    }
  }

  /**
   * 获取风速日志
   * @param ctx
   * @returns {Promise.<void>}
   * */
  static async getWindLog(ctx) {
    try {
      const { id, time } = ctx.request.body;
      const res = await siteMapModel.getWindLog(id, time);
      if (res) {
        ctx.body = {
          code: 200,
          msg: "获取成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取失败",
        };
      }
    } catch (error) {
      console.error("获取风速日志错误", error);
      ctx.body = {
        code: 500,
        msg: "获取风速日志错误",
      };
    }
  }
}

module.exports = siteMapController;

function newTree(treeData, label, treeId) {
  let result = [];

  function findNode(data) {
    for (const node of data) {
      if (node.label === label && node.id === treeId) {
        if (node.children) {
          result = node.children.map((child) => ({
            id: child.id,
            label: child.label,
            leaf: !child.children || child.children.length === 0,
          }));
        }
        return true; // 节点找到，提前返回
      } else if (node.id === treeId) {
        result = node.children.map((child) => ({
          id: child.id,
          label: child.label,
          leaf: true,
        }));
        return true; // 节点找到，提前返回
      }

      if (node.children && findNode(node.children)) {
        return true; // 节点找到，提前返回
      }
    }
    return false; // 节点未找到
  }

  findNode(treeData);
  return result;
}

