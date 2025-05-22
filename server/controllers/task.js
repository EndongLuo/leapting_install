const TaskModel = require("../models/task");
const siteMapModel = require("../models/siteMap");
const path = require("path");
const { generateDateTimeArray } = require("../utils/timedArr");
const { image_url } = require("../config/config");
const { logger } = require('../utils/logger');
const { request } = require("http");
const recognitionTypes = {
  1: "Visiblelight",
  2: "Infraredlight",
  3: "Mix",
  4: "G2",
  5: "G2 Pro",
};

class TaskController {
  // 获取安装历史速率
  static async getHistorySpeed(ctx) {
    const id = ctx.query.id;
    // console.log(id);
    
    const res = await TaskModel.getHistorySpeed(id);
    // console.log('getHistorySpeed',res);
    
    if (res) {
      ctx.body = {
        code: 200,
        msg: "获取安装历史速率成功",
        data: res,
      };
    } else {
      ctx.body = {
        code: 400,
        msg: "获取安装历史速率失败",
      };
    }
  }
  /**
   * 创建任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async createTask(ctx) {
    try {
      const data = ctx.request.body;
      // console.log(data);
      let nodes;
      if (data.recognition_type == 5) {
        const PVMIDs = await siteMapModel.getPVMIDs(data.mapName);
        const res = await TaskModel.getG1s(data.robotId);

        let PVMIDsSet = new Set(PVMIDs);
        let filterData = res.filter(e => !PVMIDsSet.has(e.from_position) && !PVMIDsSet.has(e.to_position));

        nodes = filterData.map(e => e.id);
      }
      else {
        const nodesSet = new Set();
        const nodeParts = data.nodes.split(',');

        // 准备所有的whereClauses
        const whereClauses = nodeParts.map(part => {
          const [block, row, section, num] = part.split('_');
          return { block, row, section, num };
        });
        // console.log('createTask whereClauses:', whereClauses);

        // 批量查询
        const allMaps = await Promise.all(whereClauses.map(whereClause =>
          siteMapModel.getMapPVMID(data.mapName, whereClause)
        ));

        let trimmedPVMID;
        // 处理所有的查询结果
        for (const map of allMaps) {
          for (const item of map) {
            if (data.task_type !== 'Clean') trimmedPVMID = item.PVMID.slice(0, -2);
            else trimmedPVMID = item.PVMID;
            nodesSet.add(trimmedPVMID);
          }
        }

        nodes = Array.from(nodesSet);
      }

      console.log('createTask nodes:', nodes.length, nodes);
      const res = await TaskModel.createTask({ ...data, nodes: nodes.join(',') });

      if (res) {
        console.log('创建任务成功');
        ctx.body = {
          code: 200,
          msg: '创建任务成功',
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: '创建任务失败'
        };
      }
    } catch (error) {
      console.error('创建任务错误', error);
      ctx.body = {
        code: 201,
        msg: '创建任务失败,该任务名已存在'
      };
      logger.error('创建任务失败,该任务名已存在', error)
    }
  }

  /**
     * 获取G2TaskList
     * @param ctx
     * @returns {Promise.<void>}
     */
  static async getG2TaskList(ctx) {
    try {
      const { id, siteId } = ctx.request.body;
      let g2tasklist = [];
      const { PVMIDs, tablename } = await siteMapModel.getPVMIDs(siteId);
      const res = await TaskModel.getG1s(id);

      let PVMIDsSet = new Set(PVMIDs);
      let filterData = res.filter(e => !PVMIDsSet.has(e.from_position) && !PVMIDsSet.has(e.to_position));

      filterData.forEach(item => {
        let colIndex = item.area_position.indexOf(item.from_position);
        g2tasklist.push({ id: item.id, cid: item.cid, col: colIndex });
      });
      if (res) {
        console.log("获取任务成功");
        ctx.body = {
          code: 200,
          msg: "获取任务成功",
          data: { siteId: tablename, data: g2tasklist || [] },
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取任务失败",
        };
      }
    } catch (error) {
      console.error("获取任务错误", error);
      ctx.body = {
        code: 500,
        msg: "获取任务错误",
      };
    }
  }

  /**
   * 获取任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getTask(ctx) {
    try {
      // const data = ctx.request.body;
      // console.log(data);
      var res = await TaskModel.getTask();
      res.forEach((i) => {
        i.isback = i.isback == "charge" ? "Yes" : "No";
        i.recognition_type = recognitionTypes[i.recognition_type] || "";
      });

      if (res) {
        console.log("获取任务成功");
        ctx.body = {
          code: 200,
          msg: "获取任务成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取任务失败",
        };
      }
    } catch (error) {
      console.error("获取任务错误", error);
      ctx.body = {
        code: 500,
        msg: "获取任务错误",
      };
    }
  }

  /**
   * 更新任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async updateTask(ctx) {
    const {id, done_nodes} = ctx.request.body;
    console.log(id, done_nodes);
    
    const res = await TaskModel.updateTask(id, done_nodes);
    if (res) {
      console.log("更新任务成功");
      ctx.body = {
        code: 200,
        msg: "更新任务成功",
        data: res,
      };
    }else{
      ctx.body = {
        code: 400,
        msg: "更新任务失败",
      };
    }
    
  }


  /**
   * 获取任务信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getTaskInfo(ctx) {
    const { id } = ctx.query;
    try {
      var res = await TaskModel.getTaskInfo();
      if (id == 0) res = transformData(res);
      else {
        res.forEach((i) => {
          i.task.isback = i.task.isback == "charge" ? "Yes" : "No";
          i.task.recognition_type =
            recognitionTypes[i.task.recognition_type] || "";

          const taskTypes = {
            0: "Stop",
            1: "Executing",
            2: "Pause",
            4: "Completed",
          };
          i.task_state = taskTypes[i.task_state] || "";
        });
      }

      if (res) {
        console.log("获取任务信息成功");
        ctx.body = {
          code: 200,
          msg: "获取任务信息成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取任务信息失败",
        };
      }
    } catch (error) {
      console.error("获取任务信息错误", error);
      ctx.body = {
        code: 500,
        msg: "获取任务信息错误",
      };
    }
  }

  /**
   * 获取定时任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getLimitTask(ctx) {
    const { pagesize, nowpage, optionFilter, siteID } = ctx.request.body;
    try {
      var { total, task } = await TaskModel.getLimitTask(
        pagesize,
        nowpage,
        optionFilter,
        siteID,
      );

      task.forEach((i) => {
        i.isback = i.isback == "charge" ? "Yes" : "No";
        i.recognition_type = recognitionTypes[i.recognition_type] || "";
      });
      if (task) {
        console.log("获取任务成功");
        ctx.body = {
          code: 200,
          msg: "获取任务成功",
          data: { total, task },
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取任务失败",
        };
      }
    } catch (error) {
      console.error("获取任务错误", error);
      ctx.body = {
        code: 500,
        msg: "获取任务错误",
      };
    }
  }

  /**
   * 删除任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async deleteTask(ctx) {
    try {
      const id = ctx.query.id;
      const res = await TaskModel.deleteTask(id);
      if (res) {
        // console.log(res);
        console.log("删除任务成功");
        ctx.body = {
          code: 200,
          msg: "删除任务成功",
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "删除任务失败",
        };
      }
    } catch (error) {
      console.error("删除任务错误", error);
      ctx.body = {
        code: 500,
        msg: "删除任务错误",
      };
    }
  }
  /**
   * 删除任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async deleteMultiTask(ctx) {
    try {
      const id = ctx.query.id;
      //console.log(id);

      const res = await TaskModel.deleteMultiTask(id);
      //console.log(res);

      if (res) {
        // console.log(res);
        console.log("删除任务成功");
        ctx.body = {
          code: 200,
          msg: "删除任务成功",
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "删除任务失败",
        };
      }
    } catch (error) {
      console.error("删除任务错误", error);
      ctx.body = {
        code: 500,
        msg: "删除任务错误",
      };
    }
  }
  /**
   * 创建任务信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async setTaskInfo(ctx) {
    try {
      const data = ctx.request.body;
      console.log(data);
      const res = await TaskModel.setTaskInfo(data);

      if (res) {
        // console.log(res);
        console.log("创建任务信息成功");
        ctx.body = {
          code: 200,
          msg: "创建任务信息成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "创建任务信息失败",
        };
      }
    } catch (error) {
      console.error("创建任务信息错误", error);
      ctx.body = {
        code: 500,
        msg: "创建任务信息错误",
      };
    }
  }

  /**
   * 获取分页任务信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getLimitTaskInfo(ctx) {
    const { pagesize, nowpage, optionFilter, siteID } = ctx.request.body;
    try {
      var { total, info } = await TaskModel.getLimitTaskInfo(pagesize, nowpage, optionFilter, siteID);
      //getTimed
      info.forEach((i) => {
        i.task.isback = i.task.isback == "charge" ? "Yes" : "No";
        i.task.recognition_type =
          recognitionTypes[i.task.recognition_type] || "";

        const taskTypes = {
          0: "Stop",
          1: "Executing",
          2: "Pause",
          4: "Completed",
        };
        i.task_state = taskTypes[i.task_state] || "";
      });

      if (info) {
        console.log("获取任务信息成功");
        ctx.body = {
          code: 200,
          msg: "获取任务信息成功",
          data: { total, info },
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取任务信息失败",
        };
      }
    } catch (error) {
      console.error("获取任务信息错误", error);
      ctx.body = {
        code: 500,
        msg: "获取任务信息错误",
      };
    }
  }

  /**
   * 更新任务信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async updateTaskInfo(ctx) {
    try {
      const data = ctx.request.body;
      var res = await TaskModel.updateTaskInfo(data);

      if (res) {
        console.log("更新任务信息成功");

        ctx.body = { code: 200, msg: "更新任务信息成功", data: res };
      } else {
        ctx.body = { code: 400, msg: "更新任务信息失败" };
      }
    } catch (error) {
      console.error("更新任务信息错误", error);
      ctx.body = { code: 500, msg: "更新任务信息错误" };
    }
  }

  /**
   * 更新任务信息状态
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async updateTaskInfoState(ctx) {
    try {
      const { id, task_state } = ctx.request.body;
      // console.log(id);
      var res = await TaskModel.updateTaskInfoState(id, task_state);

      if (res) {
        console.log("更新任务信息状态成功");

        ctx.body = {
          code: 200,
          msg: "更新任务信息状态成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "更新任务信息状态失败",
        };
      }
    } catch (error) {
      console.error("更新任务信息状态错误", error);
      ctx.body = {
        code: 500,
        msg: "更新任务信息状态错误",
      };
    }
  }

  /**
   * 删除任务信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async deleteTaskInfo(ctx) {
    try {
      const id = ctx.query.id;
      const res = await TaskModel.deleteTaskInfo(id);
      if (res) {
        // console.log(res);
        console.log("删除任务信息成功");
        ctx.body = { code: 200, msg: "删除任务信息成功" };
      } else {
        ctx.body = { code: 400, msg: "删除任务信息失败" };
      }
    } catch (error) {
      console.error("删除任务信息错误", error);
      ctx.body = { code: 500, msg: "删除任务信息错误" };
    }
  }

  /**
   * 删除任务信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async deleteMultiTaskInfo(ctx) {
    //console.log('deleteMulti============')
    try {
      const id = ctx.query.id;
      const res = await TaskModel.deleteMultiTaskInfo(id);
      if (res) {
        // console.log(res);
        console.log("删除任务信息成功");
        ctx.body = { code: 200, msg: "删除任务信息成功" };
      } else {
        ctx.body = { code: 400, msg: "删除任务信息失败" };
      }
    } catch (error) {
      console.error("删除任务信息错误", error);
      ctx.body = { code: 500, msg: "删除任务信息错误" };
    }
  }

  /**
   * 获取结果信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getResultInfo(ctx) {
    try {
      const { id } = ctx.request.body;
      var res = await TaskModel.getResultInfo(id);
      if (!res) return;

      if (id == 0) {
        res = res.reduce(
          (acc, item) => {
            if (!item.result_detail) item.result_detail = {};
            const type = Object.keys(item.result_detail)[0];

            if (!item.recognition_result) acc.Normal++;

            if (type === "clean") acc.clean++;
            else if (type === "infrared") acc.infrared++;
            else if (type === "connector") acc.connector++;

            return acc;
          },
          { Normal: 0, clean: 0, infrared: 0, connector: 0 }
        );
      } else
        res.forEach((i) => {
          // console.log(i);
          var date = JSON.stringify(i.update_time).slice(1, 11);
          if (!i.result_detail) return;
          var type = Object.keys(i.result_detail)[0] || "";
          i.image_url = `http://${image_url}:8080/image/${date}/${i.recognition_type}/${i.task_id}/${type}/${i.image_url}.webp`;
          // i.image_url = `http://192.168.20.155:8080/image/${date}/${i.recognition_type}/${i.task_id}/${type}/${i.image_url}.webp`
          // console.log(i.image_url);
          i.recognition_type = type;
        });

      if (res) {
        ctx.body = { code: 200, msg: "获取结果信息成功", data: res };
        console.log("获取结果信息成功");
      } else {
        ctx.body = { code: 400, msg: "获取结果信息失败" };
      }
    } catch (error) {
      console.error("获取结果信息错误", error);
      ctx.body = { code: 500, msg: "获取结果信息错误" };
    }
  }

  /**
   * 获取安全信息
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getSecurity(ctx) {
    try {
      const res = await TaskModel.getSecurity();
      // console.log(res);
      res.forEach((i) => {
        var date = JSON.stringify(i.recongition_time);
        var url = `http://${image_url}:8080/image/security/hardhat/${date.slice(
          1,
          11
        )}/${i.image_url}.webp`;
        i.image_url = url;
      });

      // console.log(res);

      if (res) {
        console.log("获取安全信息成功");
        ctx.body = {
          code: 200,
          msg: "获取安全信息成功",
          data: res,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取安全信息失败",
        };
      }
    } catch (error) {
      console.error("获取安全信息错误", error);
      ctx.body = {
        code: 500,
        msg: "获取安全信息错误",
      };
    }
  }

  /**
   * 获取结果信息PDF
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getReportPDF(ctx) {
    try {
      const { data } = ctx.request.body;
      console.log(data);

      const dir = path.join("/mnt/sda1/ftp/robot_picture/report/", data);
      console.log(dir);

      if (dir) {
        ctx.body = {
          code: 200,
          msg: "获取结果信息PDF成功",
          data: dir,
        };
      } else {
        ctx.body = {
          code: 400,
          msg: "获取结果信息PDF失败",
        };
      }
    } catch (error) {
      console.error("获取结果信息PDF错误", error);
      ctx.body = {
        code: 500,
        msg: "获取结果信息PDF错误",
      };
    }
  }

  /**
   * 创建定时任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async setTimedTask(ctx) {
    try {
      const data = ctx.request.body;
      let tdArr = [];
      console.log(data.timed);
      if (data.timings == 1)
        tdArr = [{ taskId: data.taskId, start_time: data.timed }];
      else tdArr = generateDateTimeArray(data);

      const res = await TaskModel.createTimedTask(tdArr);
      if (res) {
        // console.log(res);
        console.log("创建定时任务成功");
        ctx.body = { code: 200, msg: "创建定时任务成功", data: res };
      } else {
        ctx.body = { code: 400, msg: "创建定时任务失败" };
      }
    } catch (error) {
      console.error("创建定时任务错误", error);
      ctx.body = { code: 500, msg: "创建定时任务错误" };
    }
  }

  /**
   * 获取定时任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async getTimedTask(ctx) {
    try {
      const { limit, offset, optionFilter, siteID } = ctx.request.body;

      var { total, timedTask } = await TaskModel.getTimedTask(limit, offset, optionFilter, siteID);
      // console.log(timedTask);
      timedTask.forEach((i) => {
        // 0:待执行 1:进行中 2:已执行 3:未执行
        const taskTypes = {
          0: "Waitting",
          1: "Executing",
          2: "Completed",
          3: "Unexecuted",
        };
        // const taskTypes = { 0: '待执行', 1: '进行中', 2: '已执行', 3: '未执行' };
        i.task_state = taskTypes[i.task_state] || "";
      });

      if (timedTask) {
        console.log("获取定时任务成功");
        ctx.body = {
          code: 200,
          msg: "获取定时任务成功",
          data: { total, timedTask },
        };
      } else {
        ctx.body = { code: 400, msg: "获取定时任务失败" };
      }
    } catch (error) {
      console.error("获取定时任务错误", error);
      ctx.body = { code: 500, msg: "获取定时任务错误" };
    }
  }

  /**
   * 删除定时任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async deleteTimedTask(ctx) {
    try {
      const id = ctx.query.id;
      const res = await TaskModel.deleteTimedTask(id);
      if (res) {
        // console.log(res);
        console.log("删除定时任务成功");
        ctx.body = { code: 200, msg: "删除定时任务成功" };
      } else {
        ctx.body = { code: 400, msg: "删除定时任务失败" };
      }
    } catch (error) {
      console.error("删除定时任务错误", error);
      ctx.body = { code: 500, msg: "删除定时任务错误" };
    }
  }
  /**
   * 删除多个定时任务
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async deleteMultiTimedTask(ctx) {
    try {
      const id = ctx.query.id;
      const res = await TaskModel.deleteMultiTimedTask(id);
      if (res) {
        // console.log(res);
        console.log("删除定时任务成功");
        ctx.body = { code: 200, msg: "删除定时任务成功" };
      } else {
        ctx.body = { code: 400, msg: "删除定时任务失败" };
      }
    } catch (error) {
      console.error("删除定时任务错误", error);
      ctx.body = { code: 500, msg: "删除定时任务错误" };
    }
  }
}
module.exports = TaskController;

function transformData(data) {
  const tempData = {};

  data.forEach((item) => {
    if (!item.start_time) return;
    const date = item.start_time.substring(5, 10).replace("-", ".");
    const odomValue = parseInt(item.odom, 10);

    if (tempData.hasOwnProperty(date)) {
      // 累加已存在的日期数据
      tempData[date] += odomValue;
    } else {
      // 添加新的日期数据
      tempData[date] = odomValue;
    }
  });

  // 提取键和值，并排序日期
  const dates = Object.keys(tempData).sort((a, b) => a.localeCompare(b));
  const values = dates.map((date) => (tempData[date] * 2.278).toFixed(2));

  return { x: dates, y: values };
}
