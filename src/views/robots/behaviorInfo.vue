<template>
    <div>
      <div class="send_cancel">
        <el-input
          placeholder="behavior name"
          v-model="goalMsg.behavior_name"
          clearable>
        </el-input>
        <el-button type="primary" @click="sendGoal(goalMsg)">{{$t('table.send')}}</el-button>
          <el-button type="danger" @click="isCancel">{{$t('table.stop')}}</el-button>
      </div>
      <L_table 
      :tableData="filterData" 
      :column="column"
      @sendGoal="sendGoal"
      tableName="behaviorInfo"
      />
    </div>
  </template>
  
  <script>
  import L_table from "@/components/L_table";
  import { mapState } from 'vuex';
  import { reqBehaviorList } from "@/api";

  export default {
    components: { L_table, },
    data() {
      return {
        tableData: [],
        column:[
          {
            id:'004',
            prop:'behavior_tag',
            label:'Tag', 
            width: 150
          },
          {
            id:'001',
            prop:'uid',
            label:'ID',
            width: 100
          },{
            id:'002',
            prop:'behavior_name',
            label:'Behavior',
            width: 200
          },
          {
            id:'003',
            prop:'behavior_msg',
            label:'Message'
          },
        ],
        goalMsg:{
          behavior_name:''
        },
        goal:null,
      };
    },
    computed:{
      ...mapState('ros',['ros']),
      filterData(){
        return this.tableData.filter((p)=>{//返回过滤后的数组
            return p.behavior_name.indexOf(this.goalMsg.behavior_name) !==-1
        })//filter是过滤函数去除了不包含关键字的情况
      }
    },                                                                                                                                                                                                                                                                                                                                                                                                   
    mounted() {
      this.behaviorList();
      // this.getBehaviorList();
    },
    methods: {

      // 行为列表
      behaviorList(){
        // 订阅该主题
        var rosTopic = new ROSLIB.Topic({
            ros: this.ros,
            name: 'flexbe/behavior_list',
            messageType: 'std_msgs/String',
        });

        rosTopic.subscribe((message)=> {
          this.tableData = [];
          var msg = JSON.parse(message.data);
          var num=1;
          for (let key in msg) {
            if (msg[key].tag !== 'hide') {
            this.tableData.push({
              uid:num++, 
              behavior_name: key, 
              behavior_msg: msg[key].description,
              behavior_tag: msg[key].tag,
            })
          }
          }
        })
      },

      // 发送goal
      sendGoal(goalMsg){
        var actionClient = new ROSLIB.ActionClient({
          ros : this.ros,
          actionName : 'flexbe_msgs/BehaviorExecutionAction',
          serverName : '/flexbe/execute_behavior'
        });

        console.log(goalMsg);

        this.goal = new ROSLIB.Goal({
            actionClient : actionClient,
            goalMessage : goalMsg
          });

        this.goal.send();

        this.goal.on('feedback', (feedback)=> {
          this.$message(`feedback: ${JSON.stringify(feedback)}`);
          console.log('Feedback: ', feedback);
        });

        this.goal.on('result', (result)=> {
          this.$message(`result: ${JSON.stringify(result)}`);
          console.log('Final Result: ', result);
        });
        
        // goal.on('status', function(status) {
        //     console.log('status: ', status);
        // });
      },

      // 取消行为
      isCancel(){
        if(this.goal){
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
  .send_cancel{
    display: flex;
    margin-bottom: 10px;
  }
  .el-input{
    margin-right: 10px;
  }
  </style>
  