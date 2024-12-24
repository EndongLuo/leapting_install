import { dataProcess } from "@/utils/dataToTree";
import Vue from 'vue';
const actions = {
  // 获取ros
  getRos({ state, commit }, ros) {
    state.ros = ros;
    commit("GETDIAGNOSTIC", ros);
    commit("JSONAGG", ros);
    commit("GETFLEXBEPARAMS", ros);
  },
  getInstall({ state, commit }, { id }) {
    // state.isInstall = isInstall;
    commit("GETINSTALL", id)
  }
};

const mutations = {
  GETINSTALL(state, id) {
    console.log('GETINSTALL', id);
    state.isInstall = id;
    // Vue.set(state, 'isInstall', id);
  },
  // 订阅诊断信息
  GETDIAGNOSTIC(state, ros) {
    var rosTopic = new ROSLIB.Topic({
      ros: ros,
      name: "diagnostics_agg",
      messageType: "diagnostic_msgs/DiagnosticArray",
    });

    rosTopic.subscribe((msg) => {
      // console.log(msg.status);

      var { status, list } = diagnostics(msg);
      // console.log(status, list);

      // state.diagnosticlist = list;
      // state.diagnosticstatus = status;
      Vue.set(state, 'diagnosticstatus', status);
      Vue.set(state, 'diagnosticlist', list);

      state.diagnostics = msg.status;
      var pdu = state.diagnostics.find(itme => itme.name == '/DEVICES/PDU/rosbridge_pdu: Hardware status')
      if (!pdu) return

      state.pduStatus = pdu.values.map(item => {
        item.key = item.key.replaceAll("_", " ");
        return item
      }).filter(item => item.key.indexOf('fuse') == -1);


    });
  },

  // 订阅诊断信息json_agg
  JSONAGG(state, ros) {
    var rosTopic = new ROSLIB.Topic({
      ros: ros,
      name: "json_agg",
      messageType: "std_msgs/Header",
    });

    rosTopic.subscribe((msg) => {
      // console.log(msg.frame_id);

      var diag = JSON.parse(msg.frame_id);
      // var diag = msg;
      // console.log(diag);


      var wifi = diag.SYSTEM.underling.NET.underling.wifi.message;
      // console.log(wifi);
      let wifiobj = {};

      // 将字符串按逗号和空格分割成多个键值对
      wifi.split(/,\s+/).forEach((pair) => {
        // 键和值分离
        let [key, value] = pair.split(/:\s*/);
        wifiobj[key] = value;
      });
      wifiobj.downspeed /= 8;
      wifiobj.upspeed /= 8;

      // console.log(wifiobj);

      if (!diag) return
      // console.log(diag);
      try {
        var taskState = diag.STATUS.underling.TASK.underling.STATE.underling.task_state.message
      } catch (error) {
        var taskState = undefined
      }
      // console.log(taskState);
      // console.log(ros.isConnected);
      if (!ros.isConnected) taskState = null;
      state.taskState = taskState;

      state.wifi = wifiobj;
      // Vue.set(state.wifi, 'downspeed', wifiobj.downspeed);
      // Vue.set(state.wifi, 'upspeed', wifiobj.upspeed);
      // Vue.set(state, 'wifi', wifiobj);
      state.jsonAgg = dataProcess(diag);
    });
  },

  // 获取地图切换后名称
  GETMAPNAME(state, mapName) {
    state.mapName = mapName;
  },

  // 获取flexbe静态参数
  GETFLEXBEPARAMS(state, ros) {
    var rosTopic = new ROSLIB.Topic({
      ros: ros,
      name: "/robot_state",
      messageType: "std_msgs/String",
    });

    rosTopic.subscribe((msg) => {
      var data = JSON.parse(msg.data);

      state.flexbeParams = data.flexbe;
      if (data.git) {
        state.gitParams = data.git.res;
      }
    })
  }
};


const state = {
  ros: null,
  diagnostics: [],
  diagnosticlist: [],
  diagnosticStatus: 0,
  flexbeParams: {},
  gitParams: false,
  elTabPane: [
    {
      id: "0",
      name: "Success",
      type: "success",
      icon: "success",
    },
    {
      id: "1",
      name: "Warning",
      type: "warning",
      icon: "warning",
    },
    {
      id: "2",
      name: "Error",
      type: "danger",
      icon: "error",
    },
    {
      id: "3",
      name: "Stale",
      type: "info",
      icon: "question",
    },
    {
      id: "4",
      name: "Total",
      type: "primary",
      icon: "menu",
    },
  ],
  Device: {
    ALGORITHM: {
      hardware_id: "",
      level: 3,
      message: "Stale",
      name: "ALGORITHM",
      underling: {
        LOCALIZATION: {
          hardware_id: "",
          level: 3,
          message: "Stale",
          name: "LOCALIZATION",
        },
      },
    },
    DEVICES: {
      hardware_id: "",
      level: 3,
      message: "Stale",
      name: "DEVICES",
      underling: {
        DRIVE: { hardware_id: "", level: 3, message: "Stale", name: "DRIVE" },
        IMU: { hardware_id: "", level: 3, message: "Stale", name: "IMU" },
        LASER: { hardware_id: "", level: 3, message: "Stale", name: "LASER" },
        PLC: { hardware_id: "", level: 3, message: "Stale", name: "PLC" },
      },
    },
    STATUS: {
      hardware_id: "",
      level: 2,
      message: "Error",
      name: "STATUS",
      underling: {
        ACTION: { hardware_id: "", level: 0, message: "OK", name: "ACTION" },
        ESTOP: {
          hardware_id: "",
          level: 3,
          message: "Stale",
          name: "ESTOP",
          underling: {
            BASE: {
              hardware_id: "",
              level: 3,
              message: "Stale",
              name: "BASE",
            },
          },
        },
        MAINTENANCE: {
          hardware_id: "",
          level: 0,
          message: "OK",
          name: "MAINTENANCE",
        },
        MOTION: {
          hardware_id: "",
          level: 3,
          message: "Stale",
          name: "MOTION",
          underling: {
            BACK: {
              hardware_id: "",
              level: 3,
              message: "Stale",
              name: "BACK",
            },
            LEFT: {
              hardware_id: "",
              level: 3,
              message: "Stale",
              name: "LEFT",
            },
            RIGHT: {
              hardware_id: "",
              level: 3,
              message: "Stale",
              name: "RIGHT",
            },
          },
        },
        START: {
          hardware_id: "",
          level: 3,
          message: "Stale",
          name: "START",
          underling: {
            RELAY: {
              hardware_id: "",
              level: 3,
              message: "Stale",
              name: "RELAY",
            },
          },
        },
        TASK: {
          hardware_id: "",
          level: 0,
          message: "OK",
          name: "TASK",
          underling: {
            BEHAVIOR: {
              hardware_id: "",
              level: 0,
              message: "OK",
              name: "BEHAVIOR",
              underling: {
                "task behavior": {
                  hardware_id: "",
                  level: 0,
                  message: "reboot test:FINISHED",
                  name: "task behavior",
                },
              },
            },
            STATE: {
              hardware_id: "",
              level: 0,
              message: "OK",
              name: "STATE",
              underling: {
                "task state": {
                  hardware_id: "",
                  level: 0,
                  message: ":reboot test",
                  name: "task state",
                },
              },
            },
          },
        },
      },
    },
    SYSTEM: {
      hardware_id: "",
      level: 0,
      message: "OK",
      name: "SYSTEM",
      underling: {
        NET: {
          hardware_id: "",
          level: 0,
          message: "OK",
          name: "NET",
          underling: {
            wifi: {
              hardware_id: "",
              level: 0,
              message: "ssid:Leapting_Guest, signal:-58, upspeed:14.4, downspeed:14.8",
              name: "wifi",
            },
          },
        },
      },
    },
  },
  classifyDiagnostics: [],
  mapName: "",
  jsonAgg: [],
  wifi: {},
  pduStatus: [],
  isInstall: Number(localStorage.getItem('isInstall')) || 0,
};

const getters = {
  // 树形诊断信息
  // treeDiagnostics: ({ diagnostics }) => dataProcess(diagnostics),
  treeDiagnostics: ({ diagnostics }) => diagnostics,

  // wifi: ({jsonAgg}) => {
  //   // if (!diagnostics.SYSTEM) return
  //   console.log(jsonAgg);
  //   var wifi = jsonAgg.SYSTEM.underling.NET.underling.wifi.message;
  //   let obj = {};

  //   wifi.split(/,\s+/).forEach(pair => {
  //     let [key, value] = pair.split(/:\s*/);
  //     obj[key] = value;
  //   });
  //   return obj
  // },


  getTabPane: ({ diagnostics, elTabPane }) => {
    var data1 = diagnostics;
    for (var i = 0; i < 4; i++) {
      var num = 0;
      data1.forEach((item) => {
        if (item.level == i) num++;
      });
      elTabPane[i].num = num;
    }
    elTabPane[4].num = data1.length;
  },

  // 诊断信息分类
  getClassify: (state) => (tab) => {
    var data1 = state.diagnostics;
    if (tab !== "4") data1 = data1.filter((d) => d.level == Number(tab));
    state.classifyDiagnostics = data1;
    // state.classifyDiagnostics = dataProcess(data1);
  },
};

function diagnostics(msg) {
  const targetSet = new Set(["/Devices", "/NetWork", "/STATUS", "/DEVICES", "/SYSTEM", '/ALGORITHM', '/Other']);
  const statusMap = { "Stale": 3, "Error": 2, "Warning": 1, "OK": 0 };
  var status = 0;
  const list = [];

  msg.status.forEach(item => {
    if (targetSet.has(item.name)) {
      const processedValues = item.values.map(valueItem => {
        const mapValue = statusMap[valueItem.value] ?? -1;
        status = Math.max(status, mapValue);
        return { ...valueItem, value: mapValue };
      });
      list.push(...processedValues);
    }
  });
  return { status, list };
}

export default {
  namespaced: true,
  actions,
  mutations,
  state,
  getters,
};
