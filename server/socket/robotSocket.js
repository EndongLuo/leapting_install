const ROSLIB = require("roslib");
const schedule = require('node-schedule');
const { updateTaskInfo } = require("../models/task");
const { logger } = require('../utils/logger');
let oldState = {};
let navPathCache = {};

//清扫日志相关
const { addLog } = require("../models/robot");
const LogLevel = { 1: "DEBUG", 2: "INFO", 4: "WARN", 8: "ERROR", 16: "FATAL" };
const logs = [];
const logSet = new Set();
let estopStatus = true;
let log;

// 偏移量相关
const MapTransformer = require("../utils/mapOffset");
const transformer = new MapTransformer();

// 风速检测相关
const scheduledJobs = {};  // 用于存储已创建的任务
const siteMapModel = require("../models/siteMap");
const stateArr = {};
const state = { windIp: '', windDialog: false, windSpeed: 0, windLimit: 8, countdown: 30 };
let timers = {}; // 计时器
// 请求通讯箱风速
const axios = require('axios');
const baseUrl = 'http://10.168.5.100:8080';

async function robotSocket(socket, robotIPs, robotArr, deviceArr) {
  // console.log(robotIPs, robotArr);

  // ----------------------------- 发 布 消 息 （publish） -------------------------------------------

  // 控制
  socket.on("control", (ip, axes, buttons, frame_id) => {
    try {
      robotArr[ip].control(axes, buttons, frame_id);
      logger.info(`控制 control ${ip} ${axes} ${buttons} ${frame_id}`);
      console.log("control", ip, axes, buttons);
    } catch (error) {
      logger.error(`控制 control ${ip} ${axes} ${buttons} ${frame_id} ${error}`);
    }
  });

  // 夹爪
  socket.on("gripper", ({ ip, seq }) => {
    try {
      robotArr[ip].gripper(seq);
      logger.info(`夹爪 gripper ${ip} ${seq}`);
    } catch (error) {
      logger.error(`夹爪 gripper ${ip} ${seq} ${error}`);
    }
  });

  // 底座标定
  socket.on("baseCalibration", ({ ip }) => {
    // console.log(seq);
    try {
      robotArr[ip].baseCalibration();
      logger.info(`底座标定 baseCalibration ${ip}`);
    } catch (error) {
      logger.error(`底座标定 baseCalibration ${ip} ${error}`);
    }
  });

  // 导航
  socket.on("sendNav", (ip, data) => {
    try {
      robotArr[ip].sendNav(data);
      logger.info(`导航 sendNav ${ip} ${data}`);
      console.log("sendNav", data);
    } catch (error) {
      logger.error(`导航 sendNav ${ip} ${data} ${error}`);
    }
  });

  // 取消导航
  socket.on("cancelNav", (ip) => {
    try {
      robotArr[ip].cancelNav();
      logger.info(`取消导航 cancelNav ${ip}`);
      console.log("cancelNav", ip);
    } catch (error) {
      logger.error(`取消导航 cancelNav ${ip} ${error}`);
      console.log("cancelNav error", error);
    }
  });

  // 发送任务
  socket.on("sendTask", (ip, d) => {
    try {
      robotArr[ip].sendTask(d);
      logger.info(`发送任务 sendTask IP:${ip} taskId:${d.id} task_type: ${d.task_type} task_name: ${d.task_name} task_nodes: ${d.task_nodes}`,);
      console.log("sendTask", d);
    } catch (error) {
      logger.error(`发送任务 sendTask IP:${ip} taskId:${d.id} task_type: ${d.task_type} task_name: ${d.task_name} task_nodes: ${d.task_nodes} ${error}`);
    }
  });

  socket.on("initPose", (ip, poses) => {
    const pose = transformer.mapInverseOffset(poses, deviceArr[ip].siteId);
    robotArr[ip].initPose(pose);
  });

  // 重启工控机
  socket.on("reboot", (ip) => {
    try {
      robotArr[ip].reboot();
      logger.info(`重启工控机 reboot ${ip}`);
    } catch (error) {
      logger.error(`重启工控机 reboot ${ip} ${error}`);
      console.log("reboot error", error);
    }
  });

  // 重启程序
  socket.on("relaunch", (ip) => {
    console.log("relaunch", ip);
    try {
      robotArr[ip].relaunch();
      logger.info(`重启程序 relaunch ${ip}`);
    } catch (error) {
      logger.error(`重启程序 relaunch ${ip} ${error}`);
    }
  });

  // 回库
  socket.on("goBack", ({ ip }) => {
    console.log("goBack", ip);
    try {
      robotArr[ip].goBack();
      logger.info(`回库 goBack ${ip}`);
    }
    catch (error) {
      logger.error(`回库 goBack ${ip} ${error}`);
    }
  });

  //清扫flexbe
  socket.on("flexbeTrig", ({ ip, data }) => {
    try {
      robotArr[ip].flexbeTrig(data);
      logger.info(`清扫flexbe flexbeTrig ${ip} ${data}`);
      console.log("flexbeTrig", ip, data);

    } catch (error) {
      logger.error(`清扫flexbe flexbeTrig ${ip} ${data} ${error}`);
    }
  });

  socket.on("isOpenWork", (ip) => {
    try {
      var actionClient = new ROSLIB.ActionClient({
        ros: robotArr[ip].ros,
        actionName: "flexbe_msgs/BehaviorExecutionAction",
        serverName: "/flexbe/execute_behavior",
      });
      var goal = new ROSLIB.Goal({
        actionClient,
        goalMessage: { behavior_name: "test_container5" },
      });

      // console.log(goal);
      goal.send();
      // socket.emit('goal',flatted.stringify(goal))

      goal.on("feedback", (feedback) => {
        console.log("openFeedback: ", feedback);
        socket.emit("openFeedback", feedback.current_state);
      });

      goal.on("result", (result) => {
        console.log("Final Result: ", result);
        socket.emit("openResult", result.outcome);
      });
    } catch (error) {
      logger.error(`清扫flexbe flexbeTrig ${ip} ${data} ${error}`);
      console.log(error);
    }
  });

  // 急停
  socket.on("estop", ({ ip, data }) => {
    try {
      if (estopStatus) console.log("已开启急停");
      else console.log("已关闭急停");
      console.log("ESTOP", ip, data);
      robotArr[ip].estop(data);
    } catch (error) {
      logger.error(`急停 estop ${ip} ${data} ${error}`);
    }

  });

  // 电站部署
  socket.on("siteConfigGoal", (ip, data) => {
    try {
      console.log("siteConfigGoal", ip, data);
      logger.info(`电站部署 siteConfigGoal ${ip} ${data}`);
      var goalMessage = new ROSLIB.Message(data);

      var actionClient = new ROSLIB.ActionClient({
        ros: robotArr[ip].ros,
        actionName: "action_publish/WebActAction",
        serverName: "/site_config",
      });
      var goal = new ROSLIB.Goal({ actionClient, goalMessage });

      goal.send();

      goal.on("feedback", (feedback) => {
        socket.emit("siteConfigFeedback", ip, feedback);
        logger.info(`siteConfigFeedback ${ip} ${data} ${feedback}`);
        console.log("siteConfig Feedback: ", ip, feedback);
      });

      goal.on("result", (result) => {
        socket.emit("siteConfigResult", ip, result);
        logger.info(`siteConfigResult ${ip} ${data} ${result}`);
        console.log("siteConfig Result: ", ip, result);
      });
    } catch (error) {
      logger.error(`电站部署 siteConfigGoal ${ip} ${data} ${error}`);
    }

  });

  // 路径缓存与响应
  socket.on("navPathCache", ({ ip }) => {

    if (!navPathCache[ip]) {
      console.log("------robotSocket navPathCache", ip);
    }
    socket.emit("navPath", ip, navPathCache[ip]);
  });

  // 设置机器人参数
  socket.on("setParam", (ip, param, type, value) => {
    try {
      // console.log('setParam', ip, param, type, value);
      var data = [{ param, type, value }];
      robotArr[ip].setParam(data);
      logger.info(`设置机器人参数 setParam ${ip} ${param} ${type} ${value}`);
    } catch (error) {
      logger.error(`设置机器人参数 setParam ${ip} ${param} ${type} ${value} ${error}`);

    }

  });

  // 风速检测：是否回库
  socket.on("windIsBack", (ip, isBack) => {
    try {
      console.log("windIsBack", ip, isBack);
      if (isBack) logger.info(`客户端操作：风速检测，${ip}回库 windIsBack ${isBack}`);
      else logger.info(`客户端操作：风速检测，${ip}不回库 windIsBack ${isBack}`);
      clearInterval(timers[ip]);
      stateArr[ip].windDialog = false
      socket.server.of('/XJ').emit("windDialog", deviceArr[ip].siteId, stateArr[ip]);
    } catch (error) {
      logger.error(`windIsBack ${ip} ${isBack} ${error}`);
    }
  })

  // ----------------------------- 订 阅 消 息 （subscribe） -------------------------------------------

  robotIPs.forEach((ip) => {
    // 机器人连接
    setInterval(() => {
      socket.server.of('/XJ').emit("rosConnect", ip, robotArr[ip].rosConnect);
    }, 1000);

    // 机器人姿态
    robotArr[ip].robotPose((msg) => {
      try {
        socket.server.of('/XJ').emit("robotPose", ip, transformer.mapOffset(msg, "", deviceArr[ip].siteId))
      } catch (error) {
        console.log("robotPose", error);
      }
    });

    // 任务状态
    robotArr[ip].taskState(async (msg) => {
      socket.server.of('/XJ').emit("taskState", ip, msg);
      if (!oldState[ip])
        oldState[ip] = { state: "", id: 0, start_time: "", task_odom: 0 };
      // console.log('1',msg.id ,oldState[ip].id,msg.task_type == oldState[ip].state);
      if (msg.task_type !== oldState[ip].state) {
        // console.log('2',msg.id ,oldState[ip]);

        if (msg.id == 0) {
          msg.id = oldState[ip].id;
          msg.start_time = oldState[ip].start_time;
          msg.task_odom = oldState[ip].task_odom;
          msg.progress = 0;
        } else {
          oldState[ip].state = msg.task_type;
          oldState[ip].id = msg.id;
          oldState[ip].start_time = msg.start_time;
          oldState[ip].task_odom = msg.task_odom;
          msg.progress =
            (msg.done_nodes.length / msg.task_nodes.length).toFixed(2) * 100 ||
            0;
        }
        try {
          var res = await updateTaskInfo(msg);
          if (res[0]) console.log("taskState updated", ip, res);
          oldState[ip].state = msg.task_type;
          // console.log('oldState[ip].id',oldState[ip].id);
        } catch (error) {
          console.error("Failed to update task info:", error);
        }
      }
    });

    // 处理电量、速度
    robotArr[ip].bunkerStatus((msg) =>
      socket.server.of('/XJ').emit("bunkerStatus", ip, msg.battery_voltage, msg.linear_velocity, msg.base_state)
    );

    // 导航路径
    robotArr[ip].navPath((msg) => {
      var navPath = transformer.mapOffset(msg.poses, "", deviceArr[ip].siteId);
      console.log("navPath", navPath.length);

      navPathCache[ip] = navPath; // 缓存导航路径

      socket.server.of('/XJ').emit("navPath", ip, navPath);
    });

    // 导航结束
    robotArr[ip].navEnd((msg) => socket.server.of('/XJ').emit("navEnd", ip, msg));

    // 诊断，告警
    robotArr[ip].diagnostic((msg) => {
      const targetSet = new Set(["/Devices", "/NetWork", "/STATUS", "/DEVICES", "/SYSTEM",]);
      const statusMap = { Stale: 3, Error: 2, Warning: 1, OK: 0 };
      var status = 0;
      const list = [];

      msg.status.forEach((item) => {
        if (targetSet.has(item.name)) {
          const processedValues = item.values.map((valueItem) => {
            const mapValue = statusMap[valueItem.value] ?? -1;
            status = Math.max(status, mapValue);
            return { ...valueItem, value: mapValue };
          });
          list.push(...processedValues);
        }
      });
      socket.server.of('/XJ').emit("diagnostic", ip, { status, list });
    });

    // 点云
    robotArr[ip].scanPoints((msg) => {
      try {
        socket.server.of('/XJ').emit("scanPoints", ip, transformer.mapOffset("", msg.points, deviceArr[ip].siteId))
      } catch (error) {
        console.log('scanPoints', error);
      }
    });

    // 日志
    robotArr[ip].log(async (d) => {
      const device = deviceArr[ip].robotname || '';
      const siteId = deviceArr[ip].siteId || '';

      // 将 level 数值转换为对应的字符串
      const levelStr = LogLevel[d.level];

      // 使用 Set 存储日志来提高查重效率
      const logKey = `${device}|${d.name}|${d.msg}|${levelStr}|${d.function}`;
      if (!logSet) logSet = new Set(state.logs.map((log) => `${log.device}|${log.name}|${log.msg}|${log.level}|${log.time}`));
      log = { ip, device, tag: d.name, msg: d.msg, level: levelStr, time: d.function, description: d.file, siteId, };

      if (!logSet.has(logKey)) {
        logs.unshift(log);
        logSet.add(logKey);
        await addLog(log);
        // console.log('log added', ip, log);
      }
      socket.server.of('/XJ').emit("log", ip, log);
    });

    // 消息反馈trig
    robotArr[ip].feedBack((msg) => {
      socket.server.of('/XJ').emit("feedBack", ip, msg);
    });

    // 机械臂视频
    robotArr[ip].armVideo((msg) => {
      socket.server.of('/XJ').emit("armVideo", ip, msg);
    });

    // 获取机器人参数
    robotArr[ip].getParam((msg) => {
      // console.log('getParam', ip, msg.length);
      socket.server.of('/XJ').emit("getParam", ip, msg);
    });

    // 风速检测
    try {
      if (ip !== '10.168.4.100' && deviceArr[ip].robot_type == 'MCR') {
        if (scheduledJobs[ip]) console.log(`${ip}风速检测定时任务 已经存在`);
        else scheduledJobs[ip] = schedule.scheduleJob('1 * * * * *', () => windSpeedFn(socket, ip, deviceArr[ip].siteId));
        // else scheduledJobs[ip] = schedule.scheduleJob('*/20 * * * * *', () => windSpeedFn(socket, ip, deviceArr[ip].siteId));
      }
    } catch (error) {
      console.log('风速检测任务开始异常', deviceArr[ip]);
    }
  });
}

module.exports = { robotSocket };

async function windSpeedFn(socket, ip, id) {
  try {
    const g2Id = ip.split('.')[3];
    const { tablename, wind_limit } = await siteMapModel.getPVMIDs(id);
    let { data, code } = await getG2Info(g2Id, tablename);

    // let currentWindSpeed = 10; // 初始风速
    // const delta = (data.wind * 6 - 3).toFixed(1); // -3.0 到 3.0 的变化量
    // currentWindSpeed = Math.min(16, Math.max(0, currentWindSpeed + parseFloat(delta)));
    // data.wind = currentWindSpeed;

    if (code === 200 && data.loraConnect) {
      stateArr[ip] = state;
      // console.log('当前风速：', data.wind, '，风速限制：', wind_limit);

      var status = data.wind > wind_limit;
      if (status) {
        console.log(`siteId:${id} 当前风速：${data.wind} 风速超过限制（${wind_limit}）, ${ip} 准备回库 `);
        logger.info(`siteId:${id} 当前风速：${data.wind} 风速超过限制（${wind_limit}）, ${ip} 准备回库 `);
        stateArr[ip] = { windIp: ip, windDialog: true, windSpeed: data.wind, windLimit: wind_limit, countdown: 30, }
        if (timers[ip]) clearInterval(timers[ip]);
        timers[ip] = setInterval(async () => {
          stateArr[ip].countdown--;

          if (stateArr[ip].countdown <= 0) {
            clearInterval(timers[ip]);  // 清除定时器，停止倒计时
            stateArr[ip].windDialog = false;
            var res = await setG2Task({ g2Id, siteId: tablename, taskCode: 5 });
            if (res.code == 200) {
              logger.info(`服务端操作：${ip} 回库成功 ${res.msg}`);
              console.log(`服务端操作：${ip} 回库成功 ${res.msg}`);
            } else {
              logger.error(`服务端操作：${ip} 回库失败 ${res.msg}`);
              console.log(`服务端操作：${ip} 回库失败 ${res.msg}`);
            }
          }

          socket.server.of('/XJ').emit("windDialog", id, stateArr[ip]);
        }, 1000);  // 每秒执行一次
      }

      const WindLogData = { siteId: id, wind_speed: data.wind, wind_limit, status: Number(status) };

      await siteMapModel.setWindLog(WindLogData); // 添加风速日志到数据库
    } else {
      console.log(`else ${ip} 风速请求失败：code ${code}`);
      logger.info(`${ip} 风速请求失败：code ${code}`);
    }
  } catch (error) {
    console.log(`catch ${ip} 通讯箱未连接`);
    // logger.info(`${ip} 通讯箱未连接`);
  }
}
// 请求通讯箱风速
async function getG2Info(g2Id, siteId) {
  const url = `${baseUrl}/prod-api/robot/g2info`;

  try {
    const response = await axios.get(url, { params: { g2Id, siteId } });

    // console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('getG2Info Error fetching data:', error);
    logger.error('getG2Info Error fetching data:', error);
  }
}

async function setG2Task(data) {
  const url = `${baseUrl}/prod-api/robot/g2task`;
  try {
    const response = await axios.post(url, data, { headers: { 'Content-Type': 'application/json' } });
    // console.log('Response data:', response.data);
    return response.data;
  }
  catch (error) {
    console.error('setG2Task Error fetching data:', error);
    logger.error('setG2Task Error fetching data:', error);
  }

}
