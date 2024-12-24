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
    topic.subscribe((msg) => {
      callback(msg);
    }, (error) => {
      console.log(`Error subscribing to ${topicName}:`, error);
    });
  }

  // ----------------------------- 发 布 消 息 （publish） -------------------------------------------

  // 底盘、云台、机械臂控制
  control(axes, buttons, frame_id) {
    const message = { header: { frame_id: frame_id || '/web' }, axes, buttons: buttons || Array(8).fill(0) };
    this.publish('joy', 'sensor_msgs/Joy', message);
  }

   // 夹爪操控 seq:0  张开 seq：100 抓取
   gripper(num) {
    console.log(num);
    const message = { seq: num, frame_id: 'open_close_gripper' };
    this.publish('/trig', 'std_msgs/Header', message);
  }

  // 底座标定
  baseCalibration() {
    const message = { seq: 1, frame_id: 'zero_calibrate' };
    this.publish('/trig', 'std_msgs/Header', message);
  }

  // 重定位
  initPose(pose) {
    this.publish('/initialpose', 'geometry_msgs/PoseWithCovarianceStamped', { header: { frame_id: 'map' }, pose: { pose } });
  }

  // 发送任务
  sendTask(d) {
    this.publish('/task_nodes', 'task/task_info', d);
  }

  // 导航
  sendNav(data) {
    this.publish('/set_goal_node', 'std_msgs/String', { data });
    // this.publish('/testhaha', 'std_msgs/String', {header: { frame_id: 'Luke_luo' } });
  }

  // 取消导航
  cancelNav() {
    this.publish('/move_base/cancel', 'actionlib_msgs/GoalID', { id: '' });
  }

  // 重启工控机
  reboot() {
    this.publish('/system_cmd', 'std_msgs/String', { data: 'echo nvidia | sudo -S sudo reboot' });
  }
  
   // 重启程序
   relaunch() {
    this.publish('/system_cmd', 'std_msgs/String', { data: 'echo nvidia|~/sh_file/restart_run.sh' });
  }

  // 回库
  goBack() {
    this.publish('/go_charging', 'std_msgs/Bool', { data: true });
  }

  // 设置机器人参数
  setParam(data) {
    this.publish('/set_param', 'param/Params', { data });
  }

   // 急停
   estop(data) {
    this.publish('/estop', 'std_msgs/Bool', { data: data });
  }

  // flexbe操作
  flexbeTrig(data) {
    this.publish('/flexbe_trig', 'std_msgs/Header', { frame_id: data });
  }

  // ----------------------------- 订 阅 消 息 （subscribe） -------------------------------------------
   // 消息反馈trig
   feedBack(callback) {
    return this.subscribeTopic('/trig', 'std_msgs/Header', callback);
  }
  // 获取机器人参数
  getParam(callback) {
    this.subscribeTopic('/pub_param', 'param/Params', msg => callback(msg.data));
  }

  // 导航结束
  navEnd(callback) {
    return this.subscribeTopic('/move_base/result', 'move_base_msgs/MoveBaseActionResult', msg => callback(msg.status.status === 3));
  }

  // 路径
  async navPath(callback) {
    return this.subscribeTopic('/move_base/NavfnROS/plan', 'nav_msgs/Path', callback);
    // return this.subscribeTopic('/move_base/RsLocalPlanner/local_plan', 'nav', callback);
    // return this.subscribeTopic('/move_base/GlobalPlanner/plan', 'nav_msgs/Path', callback); //原来的
  }

  // 任务状态
  taskState(callback) {
    return this.subscribeTopic('/task_node/task_state', 'task/task_state', callback);
  }

  // 机器人姿态
  async robotPose(callback) {
    return this.subscribeTopic('/robot_pose', 'geometry_msgs/Pose', callback);
  }

  // 电量、速度
  bunkerStatus(callback) {
    return this.subscribeTopic('/bunker_status', 'bunker_msgs/BunkerStatus', callback);
  }

  // 诊断，告警
  diagnostic(callback) {
    return this.subscribeTopic('/diagnostics_agg', 'diagnostic_msgs/DiagnosticArray', callback);
  }

  // 点云
  scanPoints(callback) {
    return this.subscribeTopic('/scan_points', 'sensor_msgs/PointCloud', callback);
  }

   // 日志
   log(callback) {
    return this.subscribeTopic('/logs', 'rosgraph_msgs/Log', callback);
  }

   // 机械臂视频
   armVideo(callback) {
    return this.subscribeTopic('/arm_video', 'std_msgs/String', callback);
  }

  // --------------------------------------------------------
}

module.exports = Robot;
