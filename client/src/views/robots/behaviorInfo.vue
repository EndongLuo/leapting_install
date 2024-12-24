<template>
  <div>
    <div class="send_cancel">
      <el-input placeholder="Task Name" v-model="goalMsg.behavior_name" clearable>
      </el-input>
      <el-button type="primary" @click="sendGoal(goalMsg)">{{ $t('table.send') }}</el-button>
      <!-- <el-button type="warning"  @click="Pause(goalMsg)">{{$t('install.pause')}}</el-button> -->
      <el-button type="danger" @click="isCancel">{{ $t('table.stop') }}</el-button>
    </div>
    <L_table :tableData="filterData" :column="column" @sendGoal="sendGoal" @isCancel="isCancel"
      tableName="behaviorInfo" />
  </div>
</template>
  
<script>
import L_table from "@/components/L_table";
import { mapState } from 'vuex';
import { reqBehaviorList } from "@/api";
import { mixins } from "@/mixin/index";

export default {
  components: { L_table, },
  data() {
    return {
      tableData: [],
      column: [
        {
          id: '004',
          prop: 'behavior_tag',
          label: 'Tag',
          width: 150
        },
        {
          id: '001',
          prop: 'uid',
          label: 'Sr.No.',
          width: 100
        }, {
          id: '002',
          prop: 'behavior_name',
          label: 'Task',
          width: 200
        },
        {
          id: '003',
          prop: 'behavior_msg',
          label: 'Description'
        },
      ],
      goalMsg: {
        behavior_name: ''
      },
      goal: null,
    };
  },
  mixins: [mixins],
  computed: {
    ...mapState('ros', ['ros','flexbeParams']),
    filterData() {
      return this.tableData.filter((p) => {//返回过滤后的数组
        return p.behavior_name.indexOf(this.goalMsg.behavior_name) !== -1
      })//filter是过滤函数去除了不包含关键字的情况
    }
  },
  mounted() {
    this.behaviorList();
    // this.getBehaviorList();
  },
  methods: {
    // 筛选flexbe参数
    filterParam(name) {
      try {
        var params = this.flexbeParams[name];
        if (!params) return { arg_keys: [], arg_values: [] };

        return { arg_keys: Object.keys(params), arg_values: Object.values(params) }
      } catch (error) {
        return { arg_keys: [], arg_values: [] }
      }
    },
    // 行为列表
    behaviorList() {
      // 订阅该主题
      var rosTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: 'flexbe/behavior_list',
        messageType: 'std_msgs/String',
      });

      rosTopic.subscribe((message) => {
        this.tableData = [];
        var msg = JSON.parse(message.data);
        var num = 1;
        for (let key in msg) {
          if (msg[key].tag !== 'hide') {
            this.tableData.push({
              uid: num++,
              behavior_name: key,
              behavior_msg: msg[key].description,
              behavior_tag: msg[key].tag,
            })
          }
        }
      })
    },

    // 发送goal
    sendGoal(goalMsg) {
      console.log(goalMsg);
      if (goalMsg.behavior_name == 'CommUninstallPVM'||goalMsg.behavior_name == 'CommInUninstall') {
        this.$prompt(this.$t('prompt.uninputNum'), this.$t('prompt.prompt'), {
          confirmButtonText: this.$t('mains.confirm'),
          cancelButtonText: this.$t('mains.cancel'),
          inputPattern: /[1-9]{1}\d{0,3}/,
          inputErrorMessage: this.$t('prompt.inputErrorMessage')
        }).then(({ value }) => {

          this.$message.success('success: ' + value);

          // this.pvm_num = value;
          console.log(Number(value));
          this.CommInstall(Number(value),goalMsg);
        }).catch(() => {
          this.$message(this.$t('mains.cancel'));
        });
      }
      else {
        console.log('goalMsg',goalMsg);
        var { arg_keys, arg_values } = this.filterParam(goalMsg.behavior_name);
        var goalMessage = new ROSLIB.Message({
          behavior_name: goalMsg.behavior_name,
          arg_keys,
          arg_values
        });
        this.actionClient(goalMessage);
      }
    },
    // 发送goal
    CommInstall(pvm_num,goalMsg) {
      // var goalMessage = new ROSLIB.Message({
      //   behavior_name: 'CommUninstallPVM',
      //   arg_keys: ['pvm_sum'],
      //   arg_values: [`${pvm_num}`]
      // });

      var { arg_keys, arg_values } = this.filterParam(goalMsg.behavior_name);
        var goalMessage = new ROSLIB.Message({
          behavior_name: goalMsg.behavior_name,
          arg_keys: ['pvm_sum',...arg_keys],
          arg_values: [`${pvm_num}`, ...arg_values]
        });

      console.log(goalMessage);

      this.actionClient(goalMessage);
    },

    actionClient(goalMessage) {
      var actionClient = new ROSLIB.ActionClient({
        ros: this.ros,
        actionName: 'flexbe_msgs/BehaviorExecutionAction',
        serverName: '/flexbe/execute_behavior'
      });
      this.goal = new ROSLIB.Goal({ actionClient, goalMessage });

      console.log(this.goal);
      this.goal.send();

      this.goal.on('feedback', (feedback) => {
        // this.$message(`feedback: ${JSON.stringify(feedback)}`);
        console.log('Feedback: ', feedback);
      });

      this.goal.on('result', (result) => {
        // this.$message(`result: ${JSON.stringify(result)}`);
        if (result.outcome == 'preempted') this.$message(`task over！`);
        console.log('Final Result: ', result);
      });
    },

    Pause() {
      this.goon = 1;
      var pause_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/flexbe/command/pause',
        messageType: 'std_msgs/Bool'
      });

      if (this.flexbeSwitch) {
        this.$message.success('Go on.');
        this.flexbeSwitch = false;
      }
      else {
        this.$message('Pause');
        this.flexbeSwitch = true;
      }

      console.log(this.flexbeSwitch);
      pause_sub.publish({ "data": this.flexbeSwitch });
    },

    // 取消行为
    isCancel(a) {
      console.log(a);
      if (this.goal) {
        this.$message('行为取消！');
        this.goal.cancel();
      }
    },

    // 测试虚拟数据
    // async getBehaviorList(){
    //   var res = await reqBehaviorList();
    //   var msg = res.data.data;
    //   var num=1
    //     for (let key in msg) {
    //       this.tableData.push({
    //         uid:num++, 
    //         behavior_name: key, 
    //         behavior_msg: msg[key].description,
    //         behavior_tag: msg[key].tag,
    //       })
    //     }
    // },
  },
};
</script>
  
<style scoped>
.send_cancel {
  display: flex;
  margin-bottom: 10px;
}

.el-input {
  margin-right: 10px;
}
</style>
  