import Vue from 'vue';
import Socket from '@/utils/socketUtil';

const state = {
  socket: null,
  // ips: ['192.168.8.234'],
  ips: ['10.168.2.178'],
  // ips: ['127.0.0.1'],
  nowIP: localStorage.getItem('nowIP') || '127.0.0.1',
  taskState: {},
  Robot: {},
  Robots: [],
  rosConnect: 0,
  dialogs: {},
  newDiagnostics: { list: [], list2: [] },
  speed: { linear: 0, angular: 0 },
  battery: 0,
  gitNum: null,
  gitFeedback: false,
};

// 创建翻译映射
const translationMaps = new Map([
  ['comm_status', '通讯'],
  ['estop_status', '急停'],
  ['robot_status', '机械臂控制'],
  ['battery_voltage_alarm', '电池电压报警'],
  ['overcurrent_alarm', '放电过流报警'],
  ['sensor_status', '传感器'],
  ['joy_estop', '遥控器急停'],
  ['whisker_status', '触须'],
  ['DRIVE', '底盘车'],
  ['PLC', 'PLC'],
  ['CAMERA', '相机'],
  ['IMU', 'IMU'],
  ['ARM', '机械臂'],
  ['battery_voltage', '电池电压'],
  ['battery_current', '电池总电流'],
  ['hydraulic_voltage', '液压输出电压'],
  ['chassis_voltage', '底盘接触器电压'],
  ['inverter_voltage', ' 逆变输出电压'],
  ['hydraulic_status', '液压输出'],
  ['chassis_status', '底盘输出'],
  ['inverter_status', '逆变输出'],
  ['charger_status', '充电枪插入'],
  ['vacuum1_pressure', '真空压力1'],
  ['vacuum_pressure', '真空压力2'],
  ['temperature', '温度'],
]);

const mutations = {
  SET_NOWIP(state, ip) {
    state.nowIP = ip;
  },
  SET_SOCKET(state, socket) {
    state.socket = socket;
  },
  newDiagnostics(state, d) {
    var lan = localStorage.getItem('languageSet');
    if (d.list.length > 0) {
      if (lan !== 'en') {
        d.list.forEach(item => {
          if (translationMaps.has(item.name)) {
            item.name = translationMaps.get(item.name);
          }
        });
      }
    }

    if (d.list2.length > 0) {
      if (lan !== 'en') {
        d.list2.forEach(item => {
          if (translationMaps.has(item.name)) {
            item.name = translationMaps.get(item.name);
          }
        });
      }
    }

    Vue.set(state, 'newDiagnostics', d);
    Vue.set(state, 'Estop', d.estop);
  },
  flexbeLog(state, d) {
    // console.log('flexbeLog', d);
    Vue.set(state, 'flexbeLog', d);
  },
  setDialog(state, d) {
    // console.log('setDialog', d);
    Vue.set(state, 'dialogs', d);
  },
  // 设置任务状态
  setTaskState(state, { ip, d }) {
    state.taskState = d;
  },
};

const actions = {
  async init({ commit, state }) {
    console.log('init');

    const socket = await Socket('/XJ', state.ips);

    socket.on('connect', () => {
      console.log('Connected to server');
      commit('SET_SOCKET', socket);
    });

    socket.on('disconnect', () => {
      console.log('Disconnect');
    });

    // 机器人连接
    socket.on('rosConnect', (ip, d) => {
      Vue.set(state, 'rosConnect', d);
    });

    // robotState
    socket.on('robotState', (ip, tag, tags, gitFeedback) => {
      // console.log('robotState', ip, d);
      Vue.set(state, 'tag', tag);
      Vue.set(state, 'tags', tags);
      Vue.set(state, 'gitFeedback', gitFeedback);
    })

    // databaseUpdate
    socket.on('databaseUpdate', (ip, d) => {
      console.log('databaseUpdate', ip, d);
      Vue.set(state, 'databaseUpdate', d);
    })

    // 速度
    socket.on('speed', (ip, d) => {
      // console.log('speed', ip, d);
      state.speed = d;
      // Vue.set(state, 'speed', d);
    })
    // 电量
    socket.on('battery', (ip, d) => {
      // console.log('battery', ip, d);
      // state.battery = d;
      Vue.set(state, 'battery', d);
    })

    // dialogs
    socket.on('dialogs', (ip, d) => {
      // console.log('dialogs', ip, d);
      commit('setDialog', d);
    });

    // flexbeLog
    socket.on('flexbeLog', (ip, d) => {
      // console.log('flexbeLog', ip, d);
      commit('flexbeLog', d);
    });

    // newDiagnostics
    socket.on('newDiagnostics', (ip, d) => {
      // console.log('newDiagnostics', ip, d.status);
      commit('newDiagnostics', d);
    });

    // 任务状态
    socket.on('taskState', (ip, d) => {
      // console.log('taskState', d)
      commit('setTaskState', { ip, d });
    });

    //诊断 告警
    socket.on('diagnostic', (ip, d) => {
      // console.log('diagnostic', ip, d);

      if (!d.list[0]) return;
      if (d.list[0].key) {
        let lan = localStorage.getItem('languageSet');
        if (lan !== 'en') {
          // 如果语言不是英语，则翻译 key
          d.list.forEach(item => {
            // if (item.key == 'ESTOP' && item.value == 2) {
            //   state.Robot[ip].isEstop = true;
            // }
            // else if (item.key == 'ESTOP' && item.value == 0) {
            //   state.Robot[ip].isEstop = false
            // }
            if (translationMap.has(item.key)) {
              item.key = translationMap.get(item.key);
            }
          });
        }
        // console.log(d);

        if (!state.Robot[ip]) return
        // state.Robot[ip].diagnostic = d;
      }
      // console.log('store diagnostic', d.list);
    });

    // 日志
    socket.on('log', (ip, d) => {
      // 使用 Set 存储日志来提高查重效率
      const logKey = `${d.device}|${d.name}|${d.msg}|${d.level}|${d.time}`;
      if (!state.logSet) {
        state.logSet = new Set(state.logs.map(log => `${log.device}|${log.name}|${log.msg}|${log.level}|${log.time}`));
      }

      if (!state.logSet.has(logKey)) {
        // console.log('store log', d);
        state.logs.unshift(d);
        state.logSet.add(logKey);
      }
    })

    // action反馈
    socket.on('openFeedback', d => {
      console.log('openFeedback', d);
      state.openFeedback = d;
    })
    socket.on('openResult', d => {
      console.log('openFeedback', d);
      state.openResult = d;
    })

    // RGB图像
    socket.on('rawImg', (ip, d) => {
      // console.log('rawImg', ip, `data:image/jpeg;base64, ${d.data}`);
      state.rawImg = `data:image/png;base64, ${d.data}`;
    })

    // 深度图像
    socket.on('depImg', (ip, d) => {
      // console.log('depImg', ip, d);
      state.depImg = `data:image/png;base64, ${d.data}`;
    })

    // 分割图像
    socket.on('resImg', (ip, d) => {
      // console.log('resImg', ip, d);
      state.resImg = `data:image/png;base64, ${d.data}`;
    })

    return () => clearInterval(timer);
  },

  // ----------------------------- 发 布 消 息 （publish） -------------------------------------------
  sendDialog({ commit, state }, data) {
    // console.log('state sendDialog', data);
    state.socket.emit('sendDialog', { ip: state.ips[0], data });
  },

  //Git
  git({ commit, state }, tag) {
    console.log('state git', state.ips[0], tag);
    state.socket.emit('git', state.ips[0], tag);
  },

  HandEye({ commit, state }, data) {
    state.socket.emit('HandEye', state.ips[0], data);
  },
  statusUpdate({ commit, state }) {
    
    state.databaseUpdate = 0;
    console.log('state statusUpdate',state.databaseUpdate);
  },

  // 控制底盘与云台
  control({ commit, state }, { axes, buttons, frame_id }) {
    // console.log(axes, buttons, frame_id);
    state.socket.emit('control', state.ips[0], axes, buttons, frame_id);
  },

  // 全局控制
  globalControl({ commit, state }, data) {
    // console.log('state globalControl', data);
    state.socket.emit('globalControl', state.ips[0], data);
  },

  // 发送任务
  sendTask({ commit, state }, taskmsg) {
    console.log('state sendTask', state.ips[0], taskmsg);
    state.socket.emit('sendTask', state.ips[0], taskmsg);
  },

  // 急停 暂停 继续
  async pauseTask({ commit, state }, { ip, num, taskId }) {
    const { id, recognition_type, task_name, task_nodes, back_node } = state.Robot[ip].taskState;
    const taskmsg = {
      //#类型： 1：运行 0:停止 2:暂停
      id,
      task_type: num,
      recognition_type,
      task_name,
      back_node,
      task_nodes
    };
    // console.log('Task Msg=',ip,num,taskmsg);
    // console.log('state pauseTask',ip,num,taskmsg);
    this.dispatch('socket/sendTask', { ip, taskmsg });
  },

  // 重启工控机
  reboot({ commit, state },) {
    console.log('state reboot', state.nowIP);
    state.socket.emit('reboot', state.nowIP);
  },

  // 重启程序
  relaunch({ commit, state },) {
    console.log('state relaunch', state.nowIP);
    state.socket.emit('relaunch', state.nowIP);
  },

  // 清扫flexbe trig
  flexbeTrig({ commit, state }, data) {
    console.log('state flexbeTrig', data);
    state.socket.emit('flexbeTrig', { ip: state.nowIP, data });
  },

  // 清扫急停
  Estop({ commit, state }, data) {
    console.log('state Estop', data);
    state.socket.emit('estop', { ip: state.ips[0], data });
  },

  // armEstop
  armEstop({ commit, state }, data) {
    console.log('state armEstop', data);
    state.socket.emit('armEstop', { ip: state.ips[0], data });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};