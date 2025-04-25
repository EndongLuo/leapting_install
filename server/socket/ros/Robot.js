const ROSLIB = require('roslib');
const EventEmitter = require('events');
class Robot extends EventEmitter {
  constructor(ip) {
    super();
    this.ip = ip;
    this.rosConnect = 0;
    this.setupROS();
    setInterval(() => this.checkAndReconnect(), 5000);
  }

  setupROS() {
    this.ros = new ROSLIB.Ros({
      url: `ws://${this.ip}:9090`
    });

    this.ros.on('connection', () => this.handleConnection());
    this.ros.on('error', (error) => this.handleError(error));
    this.ros.on('close', () => this.handleClose());
  }

  handleConnection() {
    console.log(this.ip, '----------Connected to websocket server.');
    this.updateConnection(1);
  }

  handleError(error) {
    this.updateConnection(0);
  }

  handleClose() {
    if (this.ip !== '10.168.4.100') console.log(this.ip, '----------------websocket closed.');
    this.updateConnection(0);
  }

  updateConnection(rosConnect) {
    this.rosConnect = rosConnect;
    this.emit('connection', this.ip, rosConnect);
  }

  checkAndReconnect() {
    if (!this.rosConnect) this.setupROS();
  }

  Close() {
    this.ros.close();
  }

  Topic(name, messageType) {
    return new ROSLIB.Topic({
      ros: this.ros,
      name,
      messageType
    });
  }

  // Promise 化的 publish 操作
  publish(topicName, messageType, message) {
    const topic = this.Topic(topicName, messageType);
    return new Promise((resolve, reject) => {
      try {
        topic.publish(message);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Promise 化的 subscribe 操作
  subscribeTopic(topicName, messageType, callback) {
    const topic = this.Topic(topicName, messageType);
    const wrappedCallback = (msg) => callback(msg);
    topic.subscribe(wrappedCallback, (error) => console.log(`Error subscribing to ${topicName}:`, error));
    return () => topic.unsubscribe(wrappedCallback);
  }

  // ----------------------------- 发 布 消 息 （publish） -------------------------------------------

  // 底盘、云台、机械臂控制
  control(axes, buttons, frame_id) {
    const message = { header: { frame_id: frame_id || '/web' }, axes, buttons: buttons || Array(8).fill(0) };
    this.publish('joy', 'sensor_msgs/Joy', message);
  }

  // 全局操控
  globalControl(pose) {
    const message = { header: { frame_id: 'tool0' }, pose };
    this.publish('tool0_goal', 'geometry_msgs/PoseStamped', message);
  }

  // 发送任务
  sendTask(d) {
    this.publish('/task_nodes', 'task/task_info', d);
  }

  // 重启工控机
  reboot() {
    this.publish('/system_cmd', 'std_msgs/String', { data: 'echo nvidia | sudo -S sudo reboot' });
  }

  // 重启程序
  relaunch() {
    this.publish('/system_cmd', 'std_msgs/String', { data: 'echo nvidia|~/sh_file/restart_run.sh' });
  }

  // 急停
  estop(data) {
    this.publish('/estop', 'std_msgs/Bool', { data });
  }

  // 机械臂急停
  armEstop(data) {
    this.publish('/plc24_request', 'std_msgs/String', { data });
  }

  // flexbe操作
  flexbeTrig(data) {
    this.publish('/flexbe_trig', 'std_msgs/Header', { frame_id: data });
  }

  // 弹框
  sendDialog(data) {
    this.publish('/dialog', 'std_msgs/Header', { frame_id: data });
  }

  // Git 
  git(data) {
    this.publish('/robot_command', 'std_msgs/String', { data });
  }

  // ----------------------------- 订 阅 消 息 （subscribe） -------------------------------------------
  // robot_state
  robotState(callback) {
    if (this.robotStateSub) this.robotStateSub();
    this.robotStateSub = this.subscribeTopic('/robot_state', 'std_msgs/String', callback);
  }

  // database_update
  databaseUpdate(callback) {
    if (this.databaseUpdateSub) this.databaseUpdateSub();
    this.databaseUpdateSub = this.subscribeTopic('/database_update', 'std_msgs/String', callback);
  }

  // 弹框
  dialog(callback) {
    if (this.dialogSub) this.dialogSub();
    this.dialogSub = this.subscribeTopic('/dialog', 'std_msgs/Header', callback);
  }

  // flexbe log
  flexbeLog(callback) {
    if (this.flexbeLogSub) this.flexbeLogSub();
    this.flexbeLogSub = this.subscribeTopic('/flexbe/log_stamped', 'flexbe_msgs/BehaviorLog', callback);
  }

  ///message to web diagnostics
  newDiagnostics(callback) {
    if (this.newDiagnosticsSub) this.newDiagnosticsSub();
    this.newDiagnosticsSub = this.subscribeTopic('message_to_web_diagnostics', 'diagnostic_msgs/DiagnosticArray', callback);
  }

  // 消息反馈trig
  feedBack(callback) {
    if (this.feedBackSub) this.feedBackSub();
    this.feedBackSub = this.subscribeTopic('/trig', 'std_msgs/Header', callback);
  }

  // 获取机器人参数
  getParam(callback) {
    if (this.getParamSub) this.getParamSub();
    this.getParamSub = this.subscribeTopic('/param', 'param/Params', msg => callback(msg.data));
  }

  // 任务状态
  taskState(callback) {
    if (this.taskStateSub) this.taskStateSub();
    this.taskStateSub = this.subscribeTopic('/task_node/task_state', 'task/task_state', callback);
  }

  // 电量、速度
  bunkerStatus(callback) {
    if (this.bunkerStatusSub) this.bunkerStatusSub();
    this.bunkerStatusSub = this.subscribeTopic('/bunker_status', 'bunker_msgs/BunkerStatus', callback);
  }

  // 速度
  speed(callback) {
    if (this.speedSub) this.speedSub();
    this.speedSub = this.subscribeTopic('/odom', 'nav_msgs/Odometry', callback);
  }

  // 电量
  battery(callback) {
    if (this.batterySub) this.batterySub();
    this.batterySub = this.subscribeTopic('/battery_msg_topic', 'sensor_msgs/BatteryState', callback);
  }

  // 诊断，告警
  diagnostic(callback) {
    if (this.diagnosticSub) this.diagnosticSub();
    this.diagnosticSub = this.subscribeTopic('/diagnostics', 'diagnostic_msgs/DiagnosticArray', callback);
  }

  // 日志
  log(callback) {
    if (this.logSub) this.logSub();
    this.logSub = this.subscribeTopic('/logs', 'rosgraph_msgs/Log', callback);
  }

  // RGB图像
  rawImg(callback) {
    if (this.rawImgSub) this.rawImgSub();
    this.rawImgSub = this.subscribeTopic('/compressed_raw_base64', 'std_msgs/String', callback);
  }

  // 深度图像
  depImg(callback) {
    if (this.depImgSub) this.depImgSub();
    this.depImgSub = this.subscribeTopic('/compressed_dep_base64', 'std_msgs/String', callback);
  }

  // 分割图像
  resImg(callback) {
    if (this.resImgSub) this.resImgSub();
    this.resImgSub = this.subscribeTopic('/compressed_res_base64', 'std_msgs/String', callback);
  }
  
  // --------------------------------------------------------
}

module.exports = Robot;
