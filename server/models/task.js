const {
  Task,
  TaskInfo,
  TimedTask,
  Robot,
  ResultInfo,
  Security,
  G1_pro,
  FlexbeLog,
  PVMTable
} = require("../schema/index");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");
class TaskModel {
  // 获取安装历史速率
  static async getHistorySpeed(taskinfoId) {
    console.log("getHistorySpeed",taskinfoId);
    
    return await PVMTable.findAll({
      where: { taskinfoId, },
      order: [["num", "ASC"]],
    })
  }

   // 获取Flexbe日志
   static async getFlexbeLog(id, time) {
    return await FlexbeLog.findAll({
      where: {
        id,
        time: {
          [Op.gt]: time || new Date().getTime() - 24 * 60 * 60 * 1000, // 查询时间大于指定时间
        }
      },
      order: [["id", "DESC"]],
    })
  }

  // 设置Flexbe日志
  static async setFlexbeLog(data) {
    return await FlexbeLog.create({
      text: data.text,
      time: data.time,
      status_code: data.status_code,
    });
  }
  // 创建任务
  static async createTask(data) {
    return await Task.create({
      task_name: data.task_name,
      nodes: data.nodes,
      founder: data.founder,
      recognition_type: data.recognition_type,
      isback: data.isback,
      task_type: data.task_type,
      robotId: data.robotId,
    });
  }

  // 获取任务
  static async getTask() {
    return await Task.findAll({
      include: {
        model: Robot,
        attributes: ["robotname", "ip"],
      },
      order: [["id", "DESC"]],
      where: { status: 1 },
    });
  }
  // 根据分页一次获取少量任务
  static async getLimitTask(pageSize, nowpage, optionFilter,siteID) {
    // console.log("-----------Models getLimitTask", optionFilter);

    let robotWhere, taskWhere;

    // 分类
    for (const key in optionFilter) {
      var dateflag = optionFilter["date"][1] == undefined;
      if (key == "device_type" || key === "device_name") {
        robotWhere = {
          robot_type: optionFilter.device_type,
          robotname: {
            [Op.substring]: optionFilter.device_name,
          },
        };
      } else if (key == "task_name" || key == "task_type" || key == "date") {
        if (dateflag) {
          taskWhere = {
            task_name: {
              [Op.substring]: optionFilter.task_name,
            },
            recognition_type: optionFilter.task_type,
          };
        } else {
          taskWhere = {
            task_name: {
              [Op.substring]: optionFilter.task_name,
            },
            recognition_type: optionFilter.task_type,
            create_time: {
              [Op.gte]: new Date(optionFilter["date"][0]),
              [Op.lt]: new Date(optionFilter["date"][1]),
            },
          };
        }
      }
    }
    // console.log("-----------Models getTask before", robotWhere, taskWhere);
    // 去掉空值
    robotWhere = Object.fromEntries(
      Object.entries(robotWhere).filter(([key, value]) => value !== "")
    );
    taskWhere = Object.fromEntries(
      Object.entries(taskWhere).filter(([key, value]) => value !== "")
    );

    // console.log("-----------Models getLimitTask After", robotWhere, taskWhere);

    // const total = await Task.count({});
    const task = await Task.findAll({
      include: {
        model: Robot,
        attributes: ["robotname", "ip"],
        where: {siteId: siteID, ...robotWhere,}
      },
      limit: pageSize,
      offset: nowpage,
      order: [["id", "DESC"]],
      where: { status: 1, ...taskWhere },
    });
    const total = await Task.count({
      include: {
        model: Robot,
        where: {siteId: siteID, ...robotWhere,},
      },
      where: {
        status: 1,
        ...taskWhere,
      }
    });
    return { total, task };
  }

  // 删除任务
  static async deleteTask(id) {
    // return await Task.destroy({
    //   where: { id }
    // });
    const transaction = await sequelize.transaction();

    try {
      // 删除关联的 TaskInfo
      await TaskInfo.destroy({
        where: { taskId: id },
        transaction,
      });

      // 删除任务
      await Task.destroy({
        where: { id },
        transaction,
      });

      // 提交事务
      await transaction.commit();
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  }
  // 删除多选任务
  static async deleteMultiTask(id) {
    const transaction = await sequelize.transaction();

    const taskids = id.split(",");
    try {
      // 删除关联的 TaskInfo
      await TaskInfo.destroy({
        where: {
          taskId: {
            [Op.in]: taskids,
          },
        },
        transaction,
      });

      // 删除任务
      await Task.destroy({
        where: {
          id: {
            [Op.in]: taskids,
          },
        },
        transaction,
      });

      // 提交事务
      return await transaction.commit();
    } catch (error) {
      console.log(error);

      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  }

  // 修改任务
  static async updateTask(id, done_nodes) {
    return await Task.update({ done_nodes }, { where: { id } });
  }
  
  // 创建任务信息
  static async setTaskInfo(data) {
    return await TaskInfo.create({
      id: data.id,
      odom: data.task_odom,
      path: data.path,
      task_state: data.task_state,
      result: data.result,
      start_time: data.start_time,
      end_time: data.end_time,
      taskId: data.taskId,
    });
  }
  // 获取任务信息
  static async getTaskInfo() {
    return await TaskInfo.findAll({
      include: [
        {
          model: Task,
          include: { model: Robot, attributes: ["robotname", "ip"] },
        },
      ],
      order: [["start_time", "DESC"]],
    });
  }
  // 根据限制获取任务信息
  static async getLimitTaskInfo(pageSize, nowpage, optionFilter, siteID) {

    let robotWhere, taskWhere, infoWhere;

    for (const key in optionFilter) {
      if (key == "device_type" || key === "device_name") {
        robotWhere = {
          robot_type: optionFilter.device_type,
          robotname: {
            [Op.substring]: optionFilter.device_name,
          },
        };
      } else if (key == "task_name" || key == "task_type") {
        taskWhere = {
          // task_name: optionFilter.task_name,
          task_name: {
            [Op.substring]: optionFilter.task_name,
          },
          recognition_type: optionFilter.task_type,
        };
      }
    }
    var dateflag = optionFilter["date"][1] == undefined;
    // console.log("date--", dateflag, optionFilter["date"][1]);
    if (dateflag) {
      infoWhere = {};
    }
    else {
      infoWhere = {
        start_time: {
          [Op.gte]: new Date(optionFilter["date"][0]),
          [Op.lt]: new Date(optionFilter["date"][1]),
        },
      };
    }
    // console.log("-----------Models getTaskInfo before", robotWhere, taskWhere);
    // 去掉空值
    robotWhere = Object.fromEntries(
      Object.entries(robotWhere).filter(([key, value]) => value !== "")
    );
    taskWhere = Object.fromEntries(
      Object.entries(taskWhere).filter(([key, value]) => value !== "")
    );
    const info = await TaskInfo.findAll({
      include: [
        {
          model: Task,
          include: {
            model: Robot,
            attributes: ["robotname", "ip"],
            where: {siteId: siteID, ...robotWhere,}
          },
          where: taskWhere,
        },
      ],
      limit: pageSize,
      offset: nowpage,
      where: infoWhere,
      order: [["start_time", "DESC"]],
    });
    const total = await TaskInfo.count({
      include: [
        {
          model: Task,
          include: {
            model: Robot,
            where: {siteId: siteID, ...robotWhere,}
          },
          where: taskWhere,
        },
      ],
      where: infoWhere,
    });
    //console.log("getLimitTaskInfo", total);
    return { total, info };
  }

  // 更新任务信息
  static async updateTaskInfo(data) {
    return await TaskInfo.update(
      {
        path: data.path,
        task_state: data.task_status,
        odom: data.odom,
        start_time: data.start_time,
        end_time: data.end_time,
      },
      {
        where: { id: data.id },
      }
    );
  }

  // 更新任务信息状态
  static async updateTaskInfoState(id, task_state) {
    return await TaskInfo.update(
      {
        task_state: task_state,
      },
      {
        where: { id },
      }
    );
  }

  // 删除任务信息
  static async deleteTaskInfo(id) {
    return await TaskInfo.destroy({
      where: { id },
    });
  }

  // 删除任务信息
  static async deleteMultiTaskInfo(id) {
    const taskids = id.split(",");
    console.log("delete", taskids);
    return await TaskInfo.destroy({
      where: {
        id: {
          [Op.in]: taskids,
        },
      },
    });
  }

  // 获取结果信息
  static async getResultInfo(id) {
    if (id == 0)
      return await ResultInfo.findAll({
        attributes: ["recognition_result", "result_detail"],
      });
    else if (id)
      return await ResultInfo.findAll({
        where: {
          task_id: id,
          recognition_result: 1,
        },
        attributes: [
          "id",
          "node_name",
          "task_id",
          "recognition_type",
          "image_url",
          "task_name",
          "update_time",
          "result_detail",
        ],
        order: [["update_time", "DESC"]],
      });
    else
      return await ResultInfo.findAll({
        where: {
          recognition_result: 1,
          // update_time:{
          //   [Op.lt]: new Date(),
          //   [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
          // },
        },
        limit: 10,
        attributes: [
          "id",
          "node_name",
          "task_id",
          "recognition_type",
          "image_url",
          "result_detail",
          "task_id",
          "update_time",
          "result_detail",
        ],
        order: [["update_time", "DESC"]],
      });
  }

  // 获取安全检测结果 Security
  static async getSecurity() {
    return await Security.findAll({
      limit: 10,
      order: [["recongition_time", "DESC"]],
    });
  }

  // 创建定时任务
  static async createTimedTask(data) {
    return await TimedTask.bulkCreate(data);
  }

  // 获取定时信息
  static async getTimedTask(
    limit,
    offset,
    optionFilter,
    siteID,
    task_state = [0, 1, 2, 3],
    time = 0
  ) {

    let robotWhere, taskWhere, timeWhere;
    var whereConditions = { task_state: task_state };

    if (limit && offset) {
      for (const key in optionFilter) {
        if (key == "device_type" || key === "device_name") {
          robotWhere = {
            robot_type: optionFilter.device_type,
            robotname: {
              [Op.substring]: optionFilter.device_name,
            },
          };
        } else if (key == "task_name" || key == "task_type") {
          taskWhere = {
            // task_name: optionFilter.task_name,
            task_name: {
              [Op.substring]: optionFilter.task_name,
            },
            recognition_type: optionFilter.task_type,
          };
        }
      }

      var dateflag = optionFilter["date"][1] == undefined;
      // console.log("date--", dateflag, optionFilter["date"][1]);
      if (dateflag) {
        timeWhere = {};
      }
      else {
        whereConditions = {
          ...whereConditions,
          start_time: {
            [Op.gte]: new Date(optionFilter["date"][0]),
            [Op.lt]: new Date(optionFilter["date"][1]),
          },
        };
      }
      // 去掉空值
      robotWhere = Object.fromEntries(
        Object.entries(robotWhere).filter(([key, value]) => value !== "")
      );
      taskWhere = Object.fromEntries(
        Object.entries(taskWhere).filter(([key, value]) => value !== "")
      );

      const total = await TimedTask.count({
        include: [
          {
            model: Task,
            include: {
              model: Robot,
              attributes: ["robotname", "ip"],
              where: {siteId: siteID, ...robotWhere}
            },
            where: taskWhere,
          },
        ],
        where: whereConditions
      });
      const timedTask = await TimedTask.findAll({
        include: [
          {
            model: Task,
            include: {
              model: Robot,
              attributes: ["robotname", "ip"],
              where: {siteId: siteID, ...robotWhere}
            },
            where: taskWhere,
          },
        ],
        limit: limit,
        offset: offset,
        where: whereConditions,
        order: [["start_time", "DESC"]],
      });
      return { total, timedTask };
    } else {
      // 如果 time 是 1，则添加时间过滤条件
      if (time === 1) {
        const currentTime = new Date();
        const oneDayAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

        // 将时间过滤条件添加到 where 中
        whereConditions.start_time = {
          [Op.gte]: oneDayAgo,
          [Op.lte]: currentTime,
        };
      }
      return await TimedTask.findAll({
        include: [
          {
            model: Task,
            include: { model: Robot, attributes: ["robotname", "ip"] },
          },
        ],
        where: whereConditions,
        order: [["start_time", "DESC"]],
      });
    }
  }
  // 修改定时任务状态
  static async updateTimedTaskState(id, task_state) {
    return await TimedTask.update(
      {
        task_state: task_state,
      },
      {
        where: { id },
      }
    );
  }

  // 删除定时任务
  static async deleteTimedTask(id) {
    return await TimedTask.destroy({
      where: { id },
    });
  }
  // 删除多个定时任务
  static async deleteMultiTimedTask(id) {
    return await TimedTask.destroy({
      where: {
        id: {
          [Op.in]: id.split(","),
        },
      },
    });
  }
  // 获取Robot下的所有G1
  static async getG1s(robotId) {
    // console.log(robotId);
    return await G1_pro.findAll({
      where: { robotId:robotId },
      order: [['id', 'ASC']],
    });
  }
}
module.exports = TaskModel;
