const { robotSocket } = require('./robotSocket');
const { getRobotSite } = require('../models/robot');
const Robot = require('./ros/Robot');
const robotArr = {}; // 用于缓存 Robot 实例
const deviceArr = {};
const socketArr = new Map();; // 用于缓存 socket

async function XJNamespace(io) {
  const nspXJ = io.of('/XJ');

  nspXJ.on('connection', async (socket) => {
    const clientId = socket.id;
    console.log('connection', clientId);

    if (socketArr.has(clientId)) socketArr.delete(clientId);
    socketArr.set(clientId, socket);
    console.log(socketArr.size, socketArr.keys());

    const ip = socket.handshake.query.ip || ['10.168.4.220'];
    const robotIPs = JSON.parse(ip);

    // if (!Array.isArray(robotIPs))robot = robotSocket(robotIPs, socket); 
    // else robot = initializeRobots(robotIPs, socket);

    await initializeRobots(robotIPs);
    robotSocket(socket, robotIPs, robotArr, deviceArr);

    // 断开连接处理
    socket.on('disconnect', (reason) => {
      console.log(`客户端已断开: ${clientId}，原因: ${reason}`);
      socketArr.delete(clientId);
      console.log(socketArr.size, socketArr.keys());
    });
    // return robot
  });
}

module.exports = { XJNamespace, robotArr };

async function initializeRobots(robotIPs) {
  try {
    const robotPromises = robotIPs.map(async (ip) => {
      // console.log(`${socket.id}: ${ip} in Inspection`);

      if (!robotArr[ip]) robotArr[ip] = new Robot(ip);
    });
    // 等待 robotPromises 中的所有 promises 解析
    await Promise.all(robotPromises);
    // 给robotsocket.js提供一堆数据，在robotsocket里做控制，导航等等操作
    // return robotSocket(socket, robotIPs, robotArr, deviceArr);
  } catch (error) {
    console.error('Error initializing robots:', error);
  }
}

// async function initializeRobots(robotIPs, socket) {
//   try {
//     const robotPromises = robotIPs.map(async (ip) => {
//       // console.log(`${socket.id}: ${ip} in Inspection`);

//       if (!robotArr[ip]) robotArr[ip] = new Robot(ip);

//       if (!deviceArr[ip]) {
//         try {
//           //根据机器人获取场地id
//           if (ip == '10.168.4.100') return;
//           const res = await getRobotSite(ip);

//           deviceArr[ip] = { ...res[0].dataValues }
//         } catch (error) {
//           console.error(`Error getting site for IP ${ip}:`, error);
//         }
//       }
//     });
//     // 等待 robotPromises 中的所有 promises 解析
//     await Promise.all(robotPromises);
//     // 给robotsocket.js提供一堆数据，在robotsocket里做控制，导航等等操作
//     return robotSocket(socket, robotIPs, robotArr, deviceArr);
//   } catch (error) {
//     console.error('Error initializing robots:', error);
//   }
// }