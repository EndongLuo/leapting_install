<template>
  <div id="app">
    <keep-alive exclude='three'>
      <router-view />
    </keep-alive>
    <!-- <router-view /> -->

    <!-- 交互弹框 -->
    <el-dialog :visible.sync="dialogVisible" width="80%" :before-close="handleClose" center :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-weight: 1000; font-size: 48px;">提 示</span><br />
        <!-- <span style="font-weight: 800;font-size: 32px;" >Install QTY： 9</span><br/>
        <span style="font-weight: 800;font-size: 32px;" >TIME：00:11:18</span> -->
        <span style="font-weight: 800;font-size: 32px;">是否{{ toptip }}？</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="putBack">放回</el-button>
        <el-button type="primary" @click="installPV">确认</el-button>
      </span>
    </el-dialog>

    <!-- 识别失败继续识别 -->
    <el-dialog :visible.sync="shibieDialog" width="80%" :before-close="handleClose" center :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-weight: 1000; font-size: 48px;">提 示</span><br />
        <span style="font-weight: 800;font-size: 32px;">识别失败，是否重新识别？</span>
        <span style="font-weight: 800;font-size: 28px; color: chocolate;">{{ shibiePick }}</span>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="shibiePV">确认</el-button>
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
      shibieDialog: false,
      shibiePick: null,
      flag: false,
      trig_sub: null,
      toptip:null
    };
  },
  mounted() {
    this.connect();
    this.shibie();
    this.dialog();
  },
  created() {
    this.timer = setInterval(() => {
      var taskState = this.$store.state.ros.taskState;
      // console.log(this.ros.isConnected);
      if (!this.ros.isConnected) taskState = null;
      if (typeof taskState == 'undefined'|| !taskState) return;
      if (taskState.indexOf('checkPickupTF') != -1) {
        this.$message.success('抓取识别中。。。');
      }
      else if (taskState.indexOf('checkPlaceTF') != -1) {
        this.$message.success('放置识别中。。。');
      }
      else if (taskState.indexOf('checkTF') != -1) {
        this.$message.success('检测识别中。。。');
      }
      
    }, 3000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    connect() {
      var _this = this;
      // this.ros = new ROSLIB.Ros({ url: "ws://" + this.ip + ":9090" });
      // this.ros = new ROSLIB.Ros({ url: "ws://10.168.5.246:9090" }); // 杭叉
      this.ros = new ROSLIB.Ros({ url: "ws://10.168.5.247:9090" }); // 小库卡
      // this.ros = new ROSLIB.Ros({ url: "ws://192.168.8.25:9090" }); // 服务器
      // this.ros = new ROSLIB.Ros({ url: "ws://192.168.8.238:9090" }); // zeng

      this.$store.dispatch("ros/getRos", this.ros);
      // console.log(this.ros)

      //判断是否连接成功
      this.ros.on("connection", () => {
        this.connected = true;
        this.$message.success(`${this.$t('connPrompt.success')}`);
        // this.$message.success(`Place choose the last module!`);

        console.log("Connected to websocket server.");
      });

      this.ros.on("error", (error) => {
        // console.log("Error connecting to websocket server: ", error);
      });

      this.ros.on("close", () => {
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

    shibie() {
      var trig_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/trig',
        messageType: 'std_msgs/Header',
      });
      trig_sub.subscribe((msg) => {
        // console.log(msg);
        if (msg.frame_id == 'install_detect_pick') {
          if (msg.seq == 1) this.$message.success('识别成功。');
          else {
            this.$message('识别失败。');
            this.shibiePick = '请检查是否有组件或者组件是否反光。'
            this.shibieDialog = true;
          }
        }
        else if (msg.frame_id == 'install_detect_put') {
          if (msg.seq == 1) this.$message.success('识别成功。');
          else {
            this.$message('识别失败。');
            this.shibiePick = '请移动车辆：桩子与车内侧履带2m平行（误差±5cm）。'
            this.shibieDialog = true;
          }
        }
      });
    },

    // 开启弹框
    dialog() {
      var trig_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/trig',
        messageType: 'std_msgs/Header',
      });
      this.toptip = ''

      trig_sub.subscribe((msg) => {
        console.log(msg);
        var fid = msg.frame_id;
        if (fid.indexOf('UI_dump') != -1) {
          this.toptip = '释放吸盘'
          this.dialogVisible = true;
        }
        else if(fid.indexOf('UI_place') != -1){
          this.toptip = '放下光伏组件到支架上'
          this.dialogVisible = true;
        }
      })


    },
    // 放回流程
    putBack() {
      this.withDraw();
      this.dialogVisible = false;
      this.flag = false;
      this.$message({
        type: 'info',
        message: '放回中。。。'
      });
    },
    // 安装流程
    installPV() {
      this.dialogVisible = false;
      this.flag = false;
      this.uichoose("next");
      this.$message.success(`${this.toptip}`);
    },

    // 发送withDraw(放回光伏板)
    withDraw() {
      var goalMsg = new ROSLIB.Message({
        behavior_name: 'WithdrawPVM',
      });
      // console.log(goalMsg);

      var actionClient = new ROSLIB.ActionClient({
        ros: this.ros,
        actionName: 'flexbe_msgs/BehaviorExecutionAction',
        serverName: '/flexbe/execute_behavior'
      });
      this.goal = new ROSLIB.Goal({
        actionClient: actionClient,
        goalMessage: goalMsg
      });

      this.goal.send();

      this.goal.on('feedback', (feedback) => {
        // this.$message(`feedback: ${JSON.stringify(feedback)}`);
        console.log('Feedback: ', feedback);
      });

      this.goal.on('result', (result) => {
        if (result.outcome == 'preempted') this.$message(`任务结束！`);
        // this.$message(`result: ${JSON.stringify(result)}`);
        console.log('Final Result: ', result);
      });
    },

    // 重新识别
    shibiePV() {
      this.shibieDialog = false;
      this.flag = false;
      this.uichoose("next");
      this.$message('继续识别!');
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
