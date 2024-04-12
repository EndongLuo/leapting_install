<template>
  <div id="app">
    <keep-alive exclude='three'>
      <router-view />
    </keep-alive>
    <!-- <router-view /> -->

    <!-- 交互弹框 -->
    <el-dialog :visible.sync="dialogVisible" width="80%" :before-close="handleClose" center :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-weight: 1000; font-size: 48px;">{{$t('prompt.prompt')}}</span><br />
        <!-- <span style="font-weight: 800;font-size: 32px;" >Install QTY： 9</span><br/>
        <span style="font-weight: 800;font-size: 32px;" >TIME：00:11:18</span> -->
        <span style="font-weight: 800;font-size: 32px;">{{ toptip }}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-if="isback" type="info" @click="goBack" >{{$t('install.isback')}}</el-button>
        <el-button v-else type="info" @click="putBack">{{$t('install.withdraw')}}</el-button>
        <el-button type="primary" @click="installPV">{{$t('mains.confirm')}}</el-button>
      </span>
    </el-dialog>

    <!-- 识别失败继续识别 -->
    <el-dialog :visible.sync="shibieDialog" width="80%" :before-close="handleClose" center :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-weight: 1000; font-size: 48px;">{{$t('prompt.prompt')}}</span><br />
        <span style="font-weight: 800;font-size: 32px;">{{$t('identify.identifyFail')}}, {{$t('identify.identifyagain')}} ?</span>
        <span style="font-weight: 800;font-size: 28px; color: chocolate;">{{ shibiePick }}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="shibiePV">{{$t('mains.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import layout from "./views/layout";
var num = 0;
import { mapState } from 'vuex';
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
      trig_pub: null,
      toptip: null,
      timer1: null,
      num: 1,
      isback:false,
    };
  },
  computed: {
    ...mapState('ros', ['pduStatus','taskState']),
  },
  mounted() {
    this.connect();

    this.pdu_sub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/pdu_request',
      messageType: 'std_msgs/String'
    });

    this.trig_pub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/trig',
      messageType: 'std_msgs/Header',
    });

    this.shibie();
    this.dialog();

    this.$bus.$on( 'reconn' , ()=>this.connect());

    // if(this.gitParams) this.$message.success('git pull success!');
    // else this.$message.error('git pull failed!');
  },
  created() {
    
    this.timer = setInterval(() => {
      var taskState = this.$store.state.ros.taskState;
      // console.log(this.ros.isConnected);
      if (!this.ros.isConnected) taskState = null;
      if (typeof taskState == 'undefined' || !taskState) return;
      if (taskState.indexOf('checkPickupTF') != -1) {
        this.$message.success(`${this.$t('identify.checkPickupTF')}`);
      }
      else if (taskState.indexOf('checkPlaceTF') != -1) {
        this.$message.success(`${this.$t('identify.checkPlaceTF')}`);
      }
      else if (taskState.indexOf('checkTF') != -1) {
        this.$message.success(`${this.$t('identify.checkTF')}`);
      }

    }, 3000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  watch: {
    connected(val, old) {
      // console.log(val,old);
      if (val == false) {
        if (this.timer1) clearInterval(this.timer1);
        else this.timer1 = setInterval(() => {
          if (this.num > 6) return;
          console.log(`${this.$t('connPrompt.reconn')}${this.num}....`);
          this.$message(`${this.$t('connPrompt.reconn')}${this.num}...`);
          this.connect();
          this.num++;
        }, 30000);
      }
      else {
        this.num = 1;
        clearInterval(this.timer1);
        this.timer1 = null;
      }
    },
  },
  
  methods: {
    jishiqi() {
      this.$notify({
        title: '提示',
        message: '这是一条不会自动关闭的消息',
        duration: 30000
      });
    },
    launchSwitch(s, n) {
      var msg = new ROSLIB.Message({ seq: s, frame_id: `launch:${n}` });
      this.trig_pub.publish(msg);
    },
    connect() {
      var _this = this;
      this.ros = new ROSLIB.Ros({ url: "ws://" + this.ip + ":9090" });
      //  this.ros = new ROSLIB.Ros({ url: "ws://192.168.8.25:9090" }); // 服务器
      //  this.ros = new ROSLIB.Ros({ url: "ws://10.168.5.247:9090" }); // 服务器

      this.$store.dispatch("ros/getRos", this.ros);
      // console.log(this.ros)

      //判断是否连接成功
      this.ros.on("connection", () => {
        this.connected = true;
        this.$message.success(`${this.$t('connPrompt.success')}`);
        console.log("Connected to websocket server.");

        // clearInterval(this.timer1);
        // this.timer1 = null;
      });

      this.ros.on("error", (error) => {
        // console.log("Error connecting to websocket server: ", error);
      });

      this.ros.on("close", () => {
        this.connected = false;
        this.$message.error(`${this.$t('connPrompt.close')}`);
        console.log("Connection to websocket server closed.");
      });

      // 巡检测试代码块
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
      this.trig_pub.subscribe((msg) => {
        // console.log(msg);
        if (msg.frame_id == 'install_detect_pick') {
          if (msg.seq == 1) this.$message.success(`${this.$t('identify.identifyOk')}`);
          else {
            this.$message(`${this.$t('identify.identifyFail')}`);
            this.shibiePick = this.$t('identify.identifyPick')
            this.shibieDialog = true;
          }
        }
        else if (msg.frame_id == 'install_detect_put') {
          if (msg.seq == 1) this.$message.success(`${this.$t('identify.identifyOk')}`);
          else {
            this.$message(`${this.$t('identify.identifyFail')}`);
            this.shibiePick = this.$t('identify.identifyPut')
            this.shibieDialog = true;
          }
        }
      });
    },

    // 半自动弹框
    dialog() {
      this.toptip = ''

      this.trig_pub.subscribe((msg) => {
        console.log(msg);
        var fid = msg.frame_id;
        if (fid.indexOf('UI_dump') != -1) {
          this.toptip = this.$t('identify.UI_dump');
          this.dialogVisible = true;
        }
        else if (fid.indexOf('UI_place') != -1) {
          this.toptip = this.$t('identify.UI_place');
          this.dialogVisible = true;
        }
        else if (fid.indexOf('UI_handeye_arm') != -1) {
          this.toptip = this.$t('identify.UI_handeye_arm');
          this.dialogVisible = true;
        }
        else if (fid.indexOf('UI_handeye_take') != -1) {
          this.toptip = this.$t('identify.UI_handeye_take');
          this.dialogVisible = true;
        }
        else if (fid.indexOf('UI_continue') != -1) {
          this.toptip = this.$t('identify.UI_continue');
          this.isback = true;
          this.dialogVisible = true;
        }
        console.log(this.toptip);
      })
    },
    // 最后一步是否前进 （不继续）
    goBack(){
      this.trig_pub.publish({frame_id:"goback"})
      this.isback = false;
      this.dialogVisible = false;
    },
    // 放回流程
    putBack() {
      this.withDraw();
      this.dialogVisible = false;
      this.flag = false;
      this.$message(`${this.$t('identify.putting')}`);
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
        if (result.outcome == 'preempted') this.$message(`${this.$t('identify.taskover')}`);
        // this.$message(`result: ${JSON.stringify(result)}`);
        console.log('Final Result: ', result);
      });
    },

    // 重新识别
    shibiePV() {
      this.shibieDialog = false;
      this.flag = false;
      this.uichoose("next");
      this.$message(`${this.$t('identify.identifyagain')}`);
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
      this.$confirm(`${this.$t('identify.close')}`)
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
  },
};
</script>

<style>
/* body {
  background: url('../public/img/9.png') no-repeat; 
  background-size: cover;
} */

#app {
  /* position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.123);
  -webkit-backdrop-filter: blur(15px);
  backdrop-filter: blur(15px); */
  color: #dddddd;
}
</style>
