const RobotParamModel = require('../models/robotParam');
const TaskModel = require('../models/task')

module.exports = function() {
    return async function(ctx, next){
      const robotParamData= [
        {'id': 1,'param_name': 'robot_name', 'param_type': 'STRING', 'param_value': 'MMR', 'param_class': 'web', 'param_description': '设备名称'},
        {'id': 2,'param_name': 'robot_type', 'param_type': 'STRING', 'param_value': 'MMR', 'param_class': 'web', 'param_description': '设备类型'},
        {'id': 3,'param_name': 'video_show', 'param_type': 'STRING', 'param_value': '1', 'param_class': 'web', 'param_description': '是否开启图像'},
        {'id': 4,'param_name': 'robot_ip', 'param_type': 'STRING', 'param_value': '192.168.147.9', 'param_class': 'web', 'param_description': '设备IP'},
        {'id': 5,'param_name': 'low_battery', 'param_type': 'INTEGER', 'param_value': '20', 'param_class': 'web', 'param_description': '电量报警值'},
        {'id': 6,'param_name': '/robot_state/pvm_length', 'param_type': 'INTEGER', 'param_value': '2278', 'param_class': 'ros', 'param_description': '组件长度'},
        {'id': 7,'param_name': '/robot_state/pvm_width', 'param_type': 'INTEGER', 'param_value': '1134', 'param_class': 'ros', 'param_description': '组件宽度'},
        {'id': 8,'param_name': '/robot_state/pvm_thickness', 'param_type': 'INTEGER', 'param_value': '35', 'param_class': 'ros', 'param_description': '组件厚度'},
        {'id': 9,'param_name': '/line_gap', 'param_type': 'INTEGER', 'param_value': '50', 'param_class': 'ros', 'param_description': '直线间距'},
        {'id': 10,'param_name': '/cell_length', 'param_type': 'FLOAT', 'param_value': '92.5', 'param_class': 'ros', 'param_description': '电池片宽度'},
        {'id': 11,'param_name': '/hole_gap', 'param_type': 'INTEGER', 'param_value': '400', 'param_class': 'ros', 'param_description': '孔间距'},
        {'id': 12,'param_name': '/pvmedge_hole_gap', 'param_type': 'INTEGER', 'param_value': '25', 'param_class': 'ros', 'param_description': '孔边间距'},
        {'id': 13,'param_name': '/uninstall_z', 'param_type': 'INTEGER', 'param_value': '350', 'param_class': 'ros', 'param_description': '拆卸高度'},
        {'id': 14,'param_name': '/cup_length', 'param_type': 'INTEGER', 'param_value': '80', 'param_class': 'ros', 'param_description': '吸盘长度'},
        {'id': 15,'param_name': '/pressure_threshold', 'param_type': 'INTEGER', 'param_value': '500', 'param_class': 'ros', 'param_description': '压力阈值'},
        {'id': 16,'param_name': '/bridgegap', 'param_type': 'INTEGER', 'param_value': '100', 'param_class': 'ros', 'param_description': '桥架间隙'},
        {'id': 17,'param_name': '/bridgeenable', 'param_type': 'BOOL', 'param_value': '0', 'param_class': 'ros', 'param_description': '桥架间隙是否启用'},
        {'id': 18,'param_name': '/trajectory_path/enable', 'param_type': 'BOOL', 'param_value': '0', 'param_class': 'ros', 'param_description': '避障是否开启'},
        {'id': 19,'param_name': '/trajectory_path/stop_distance', 'param_type': 'FLOAT', 'param_value': '2.4', 'param_class': 'ros', 'param_description': '避障距离'},
        {'id': 20,'param_name': '/mid360_elect_fence/detect_dis', 'param_type': 'FLOAT', 'param_value': '2.0', 'param_class': 'ros', 'param_description': '电子围栏检测范围值'},
        {'id': 21,'param_name': '/mid360_elect_fence/open_fence_bool', 'param_type': 'BOOL', 'param_value': 'false', 'param_class': 'ros', 'param_description': '电子围栏是否开启'},
    ]
    const robot_param_res = await RobotParamModel.init(robotParamData);
    console.log('initRobotParamTable', robot_param_res);

    const taskData = [
        {'id': 0,'task_name': '自动安装', 'nodes': '', 'done_nodes': '', 'founder': 'luke', 'recognition_type': '', 'isback': '', 'task_type': '0', 'create_time': new Date(), 'update_time': new Date(), 'status': 1},
        {'id': 1,'task_name': '扫码安装', 'nodes': '', 'done_nodes': '', 'founder': 'luke', 'recognition_type': '', 'isback': '', 'task_type': '1', 'create_time': new Date(), 'update_time': new Date(), 'status': 1},
        {'id': 2,'task_name': '拆卸', 'nodes': '', 'done_nodes': '', 'founder': 'luke', 'recognition_type': '', 'isback': '', 'task_type': '2', 'create_time': new Date(), 'update_time': new Date(), 'status': 1}
    ]
    const task_res = await TaskModel.init(taskData);
    console.log('initTaskTable', task_res);
    await next(); //运行完毕，交给下一个中间件
  };

      }
