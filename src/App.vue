<template>
  <div id="app">
    <router-view />

     <!-- 交互弹框 -->
     <el-dialog  :visible.sync="dialogVisible" width="80%" :before-close="handleClose" center
      :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <!-- <span style="font-weight: 1000; font-size: 48px;">Installation completed ！</span><br/>
        <span style="font-weight: 800;font-size: 32px;" >Install Num： 9</span><br/>
        <span style="font-weight: 800;font-size: 32px;" >TIME：00:11:18</span> -->
        <span style="font-weight: 800;font-size: 32px;" >Do you want to continue with the installation</span>

      </div>
      
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="putBack">Put Back</el-button>
        <el-button type="primary" @click="installPV">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import layout from "./views/layout";

export default {
  name: "App",
  components: {
    layout,
  },
  data() {
    return {
      ip: window.location.hostname,
      connected: false,
      ros: null,
      viewer: null,
      ws: 'ws://10.168.5.252:9090',
      dialogVisible: false,
    };
  },
  mounted() {
    this.connect();
  },
  created() {
    this.timer = setInterval(this.dialog, 3000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    connect() {
      var _this = this;
      // this.ros = new ROSLIB.Ros({ url: "ws://" + this.ip + ":9090" });
      // this.ros = new ROSLIB.Ros({ url: "ws://10.168.5.252:9090" }); // 杭叉
      this.ros = new ROSLIB.Ros({ url: "ws://10.168.5.251:9090" }); // 小库卡
      // this.ros = new ROSLIB.Ros({ url: "ws://10.168.5.253:9090" }); // 夹爪
      // this.ros = new ROSLIB.Ros({ url: "ws://10.168.5.240:9090" }); // 巡检
      // this.ros = new ROSLIB.Ros({ url: "ws://192.168.8.25:9090" }); // 服务器
      // this.ros = new ROSLIB.Ros({ url: "ws://192.168.8.238:9090" }); // zeng

      this.$store.dispatch("ros/getRos", this.ros);
      // console.log(this.ros)

      //判断是否连接成功
      this.ros.on("connection",  ()=> {
        this.connected = true;
        this.$message.success(`${this.$t('connPrompt.success')}`);
        
        console.log("Connected to websocket server.");
      });

      this.ros.on("error",  (error)=> {
        // console.log("Error connecting to websocket server: ", error);
      });

      this.ros.on("close",  ()=> {
        this.connected = false;
        this.$message.error(`${this.$t('connPrompt.close')}`);

        console.log("Connection to websocket server closed.");
      });

      // var actionClient = new ROSLIB.ActionClient({
      //   ros: this.ros,
      //   actionName: "/tf2_web_republisher/TFSubscriptionAction",
      //   serverName: "/tf2_web_republisher",
      // });

      // console.log(actionClient);
      // // create a goal
      // var Goal = new ROSLIB.Goal({
      //   actionClient: actionClient,
      //   goalMessage: {
      //     source_frames: ['link_1','link_2','link_3','link_4','left_front_link'],
      //     target_frame: 'base',
      //     angular_thres: 0.001,
      //     trans_thres: 0.001,
      //     rate: 10,
      //   },
      // });

      // Goal.send();

      // Goal.on("feedback", (feedback) => {
      //   console.log("feedback: ", feedback);
      // });

      // Goal.on("result", (result) => {
      //   console.log("result: ", result);
      // });

      // Goal.on("status", (status) => {
      //   console.log("status: ", status);
      // });
    },

    // 开启弹框
    dialog(){
      var taskState = this.$store.state.ros.taskState
      // console.log(taskState);
        
      if (typeof taskState == 'undefined') return;
      if (taskState.indexOf('UI') != -1 && !this.dialogVisible){
        console.log(1);
        this.dialogVisible = true;
      } 
      else if(taskState.indexOf('UI') == -1 && this.dialogVisible) setTimeout(()=>{ this.dialogVisible = false;}, 2000);
      
    },
    // 放回流程
    putBack() {
      this.dialogVisible = false;
      this.uichoose("withdraw");
      this.$message({
        type: 'info',
        message: '放回中。。。'
      });
    },
    // 安装流程
    installPV() {
      this.dialogVisible = false;
      this.uichoose("next");
      this.$message({
        type: 'success',
        message: '光伏板已放下，可以开始打螺丝!'
      });
    },
    uichoose(Msg) {
      // 订阅该主题
      this.git_pub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/trig',
        messageType: 'std_msgs/Header',
      });
      var uiMsg = new ROSLIB.Message({ frame_id: Msg });
      this.git_pub.publish(uiMsg);
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
  },
};
</script>

<style></style>
