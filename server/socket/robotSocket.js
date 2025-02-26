const ROSLIB = require("roslib");
const { updateTaskInfo, setFlexbeLog } = require("../models/task");
const { logger } = require('../utils/logger');
let oldState = {};
let navPathCache = {};
const flexbeLogs = [];

//清扫日志相关
const { addLog } = require("../models/robot");
const LogLevel = { 1: "DEBUG", 2: "INFO", 4: "WARN", 8: "ERROR", 16: "FATAL" };
const logs = [];
const logSet = new Set();
let estopStatus = true;
let log;
let rostimers = {};
let timers = {};
let dialogMsg = { text: "", btns: [], dialog: true };

async function robotSocket(socket, robotIPs, robotArr, deviceArr) {
  // console.log(robotIPs, robotArr);

  // ----------------------------- 发 布 消 息 （publish） -------------------------------------------

  // 控制
  socket.on("control", (ip, axes, buttons, frame_id) => {
    try {
      robotArr[ip].control(axes, buttons, frame_id);
      // logger.info(`控制 control ${ip} ${axes} ${buttons} ${frame_id}`);
      // console.log("control", ip, axes, buttons);
    } catch (error) {
      logger.error(`控制 control ${ip} ${axes} ${buttons} ${frame_id} ${error}`);
    }
  });

  // 全局控制
  socket.on("globalControl", (ip, pose) => {
    try {
      robotArr[ip].globalControl(pose);
      // logger.info(`全局控制 globalControl ${ip} ${pose}`);
      // console.log("globalControl", ip, pose);
    } catch (error) {
      logger.error(`全局控制 globalControl ${ip} ${pose} ${error}`);
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

  // 手眼标定
  socket.on("HandEye", (ip, d) => {
    try {
      var actionClient = new ROSLIB.ActionClient({
        ros: robotArr[ip].ros,
        actionName: "flexbe_msgs/BehaviorExecutionAction",
        serverName: "/flexbe/execute_behavior",
      });

      var goalMessage = new ROSLIB.Message({
        behavior_name: 'HandEyeCalibration',
        arg_keys: ['if_auto_all'],
        arg_values: [`${d}`]
      });
      var goal = new ROSLIB.Goal({ actionClient, goalMessage, });

      goal.send();

      goal.on("feedback", (feedback) => {
        console.log("openFeedback: ", feedback);
        // socket.emit("openFeedback", feedback.current_state);
      });

      goal.on("result", (result) => {
        var res = false;
        console.log("Final Result: ", result);
        if (result.outcome == 'preempted' || result.outcome == 'finished') res = true;
        socket.emit("openResult", res);
      });
    } catch (error) {
      logger.error(`清扫flexbe flexbeTrig ${ip} ${d} ${error}`);
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

  // armEstop
  socket.on("armEstop", ({ ip, data }) => {
    try {
      console.log("armEstop", ip, data);
      robotArr[ip].armEstop(data);
    } catch (error) {
      logger.error(`armEstop ${ip} ${data} ${error}`);
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

  // 弹窗交互
  socket.on("sendDialog", ({ ip, data }) => {
    try {
      console.log("sendDialog", ip, data);
      robotArr[ip].sendDialog(data);
      dialogMsg.dialog = false;
      socket.server.of('/XJ').emit("dialogs", ip, dialogMsg);
      // logger.info(`sendDialog ${ip} ${msg}`);
    } catch (error) {
      logger.error(`sendDialog ${ip} ${data} ${error}`);
    }
  });

  //Git
  socket.on("git", (ip) => {
    try {
      console.log("git", ip);
      
      robotArr[ip].git();
      logger.info(`git ${ip}`);
    } catch (error) {
      logger.error(`git ${ip} ${error}`);
    }
  })

  // ----------------------------- 订 阅 消 息 （subscribe） -------------------------------------------

  robotIPs.forEach((ip) => {
    // 机器人连接
    if (rostimers[ip]) clearInterval(rostimers[ip]);
    rostimers[ip] = setInterval(() => {
      socket.server.of('/XJ').emit("rosConnect", ip, robotArr[ip].rosConnect);
    }, 1000);

    // robot_state
    robotArr[ip].robotState((msg) => {
      // console.log("robotState", msg);
      msg = JSON.parse(msg.data);
      var gitNum = msg.git.info.msg
      socket.server.of('/XJ').emit("robotState", ip, gitNum);
    })

    // 速度
    robotArr[ip].speed((msg) => {
      const angular = (msg.twist.twist.angular.z).toFixed(1);
      const linear = (msg.twist.twist.linear.x).toFixed(1);
      socket.server.of('/XJ').emit("speed", ip, { angular, linear });
    })

    // 电量
    robotArr[ip].battery((msg) => {
      // console.log("battery", msg);
      let percentage =msg.percentage;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      socket.server.of('/XJ').emit("battery", ip, parseInt(percentage));
      // socket.server.of('/XJ').emit("battery", ip, 40);
    })

    // dialogs
    robotArr[ip].dialog(({ frame_id }) => {
      // let dialogMsg = { text: "", btns: [] };
      dialogMsg.dialog = true;
      if (!frame_id.includes("UI")) return;
      if (frame_id.includes(":")) {
        let parts = frame_id.split(":");
        dialogMsg.text = parts[1];
        dialogMsg.btns = parts.slice(2);
      } else dialogMsg.text = frame_id;

      socket.server.of('/XJ').emit("dialogs", ip, dialogMsg);
    });

    // flexbe log
    robotArr[ip].flexbeLog(async (msg) => {
      const isDuplicate = flexbeLogs.some((log) => `[${log.time}]: ${log.text}` === msg.text);
      if (!isDuplicate) {
        const timeRegex = /^\[(.*?)\]:\s*/;
        const match = msg.text.match(timeRegex);

        if (match) {
          const time = match[1];
          const text = msg.text.replace(timeRegex, '');
          msg = { ...msg, text, time };
        }
        var res = await setFlexbeLog(msg);
        flexbeLogs.push(msg);
        if (flexbeLogs.length > 100) flexbeLogs.shift();
      }
      socket.server.of('/XJ').emit("flexbeLog", ip, flexbeLogs);
    });

    // newDiagnostics
    robotArr[ip].newDiagnostics((msg) => {
      // console.log('robot Socket newDiagnostics');
      var status = 0;
      var list = [];
      var list2 = [];
      msg.status.forEach((i) => {
        if (i.level === 1) {
          list.push(i);
          status = Math.max(status, i.message);
        }
        else if (i.level === 2) list2.push(i);
      });
      socket.server.of('/XJ').emit("newDiagnostics", ip, { status, list, list2 });
    });

    // 任务状态
    robotArr[ip].taskState(async (msg) => {
      socket.server.of('/XJ').emit("taskState", ip, msg);
      if (!oldState[ip])
        oldState[ip] = { state: "", id: 0, start_time: "" };
      if (msg.task_type !== oldState[ip].state) {

        if (msg.id == 0) {
          msg.id = oldState[ip].id;
          msg.start_time = oldState[ip].start_time;
          msg.progress = 0;
        } else {
          oldState[ip].state = msg.task_type;
          oldState[ip].id = msg.id;
          oldState[ip].start_time = msg.start_time;
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


    // 获取机器人参数
    robotArr[ip].getParam((msg) => {
      // console.log('getParam', ip, msg.length);
      socket.server.of('/XJ').emit("getParam", ip, msg);
    });

  });
}

module.exports = { robotSocket };