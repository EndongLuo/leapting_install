<template>
  <div class="home">
    <Tips />
    <div class="h_outer">
      <div class="h_inner" :style="{ 'margin': isShow ? ' 1% 0' : '10% 0' }" v-show="!isShow" @click="checkRos()">
        <!-- 操控 -->
        <div class="btn" :title="$t('install.control')" @click="isShow = 3">
          <img src="./img/joy.png" alt="">
          <span>{{ $t('install.control') }}</span>
        </div>

        <!-- 机械臂操控 -->
        <div class="btn" :title="$t('install.armcontrol')" @click="isShow = 4">
          <img src="./img/arm.png" alt="">
          <span>{{ $t('install.armcontrol') }}</span>
        </div>
        
        <!-- 半自动安装 -->
        <div class="btn" :title="$t('install.sai')"  @click="isShow = 1">
          <img src="./img/bauto.png" alt="">
          <span>{{ $t('install.sai') }}</span>
        </div>

        <!-- 自动安装 -->
        <div class="btn" :title="$t('install.fai')"  @click="isShow = 2">
          <img src="./img/auto.png" alt="">
          <span>{{ $t('install.fai') }}</span>
        </div>
      </div>
    </div>

    <!-- 开始后 -->
    <div class="kuang" v-show="isShow">
      <i class="el-icon-close" @click="isShow = 0"></i>
      <!-- 机器人遥控 -->
      <div v-if="isShow == 3">
        <Telecontrol />
      </div>
      <div v-else-if="isShow == 4" class="l2">
        <div class="in" :title="$t('install.monitor')" @click="poseAction('armTopPose')">
          <span>展开</span>
          <!-- <img src="./img/video1.png" alt=""> -->
          <!-- <span>{{ $t('install.monitor') }}</span> -->
        </div>

        <div class="in" :title="$t('install.pause')" @click="poseAction('armPlaceDetectPose')">
          <span>检测</span>
          <!-- <img src="./img/pause1.png" alt=""> -->
          <!-- <span>{{ $t('install.pause') }}</span> -->
        </div>
        <div class="in" :title="$t('install.start')" @click="poseAction('armInitPose')">
          <span>收起</span>
          <!-- <img src="./img/start.png" alt=""> -->
          <!-- <span>{{ $t('install.start') }}</span> -->
        </div>
        <div class="in" :title="$t('install.stop')" @click="Stop()">
          <!-- <img src="./img/stop.png" alt="" @click="Stop()"> -->
          <span>{{ $t('install.stop') }}</span>
        </div>
        <div class="in" :title="$t('install.stop')" @click="control('Z',10)">
          <!-- <img src="./img/stop.png" alt="" @click="Stop()"> -->
          <span>上</span>
        </div>
        <!-- <Telecontrol /> -->
      </div>
      <!-- 安装 -->
      <div class="l2" v-else>
        <div class="in" :title="$t('install.monitor')" @click="videoRos()">
          <img src="./img/video1.png" alt="">
          <span>{{ $t('install.monitor') }}</span>
        </div>

        <div v-if="!flexbeSwitch" class="in" :title="$t('install.pause')" @click="Pause()">
          <img src="./img/pause1.png" alt="">
          <span>{{ $t('install.pause') }}</span>
        </div>
        <div v-else class="in" :title="$t('install.start')" @click="start(isShow)">
          <img src="./img/start.png" alt="">
          <span>{{ $t('install.start') }}</span>
        </div>
        <div class="in" :title="$t('install.stop')">
          <img src="./img/stop.png" alt="" @click="Stop()">
          <span>{{ $t('install.stop') }}</span>
        </div>
        <div class="in" :title="$t('install.model')" @click="isThree = 1">
          <img src="./img/3d.png" alt="">
          <span>{{ $t('install.model') }}</span>
        </div>
      </div>
    </div>

    <!-- 可拖拽框 -->
    <div style="position: absolute; top: 0;left: 0; width: 100%; height: 100%;" v-if="isVideo||isThree">
      <Toast v-if="isVideo">
        <template slot="title">
          <span>{{ $t('install.monitor') }}</span>
          <i class="el-icon-close" style="cursor: pointer;" @click="pauseRos()"></i>
        </template>
        <img v-if="!urlVideo" src="./img/empty.png" alt="">
        <img v-else :src="urlVideo" alt="">
      </Toast>
      <Toast v-if="isThree">
        <template slot="title">
          <span>{{ $t('install.model') }}</span>
          <i class="el-icon-close" style="cursor: pointer;" @click="isThree = 0"></i>
        </template>
        <Three v-if="isThree" />
      </Toast>
    </div>
  </div>
</template>

<script>
import Tips from "./tips";
import Telecontrol from "@/components/Telecontrol";
import { number } from "echarts";
import { mapState } from "vuex";
import Toast from "@/components/toast";
import Three from '@/components/three/index_hc.vue'

export default {
  name: "home",
  components: { Tips, Telecontrol, Toast, Three },
  data() {
    return {
      isShow: 0,
      isInstall: 0,
      isVideo: 0,
      isThree: 0,
      urlVideo: null,
      video_sub: null,
      flexbeSwitch: true,
      pvm_num: 50,
      goal: null,
      goon:0
    };
  },
  computed: {
    ...mapState("ros", ["ros",]),
  },
  mounted() {
    // this.$message.success('Installation Completed');
  },
  methods: {
    // control
    control(axis,offset){
      var goalMsg = new ROSLIB.Message({
        behavior_name: 'TransManipulation',
        arg_keys: ['axis','offset'],
        arg_values: [`${axis}`,`${offset}`]
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
        this.$message(`feedback: ${JSON.stringify(feedback)}`);
        console.log('Feedback: ', feedback);
      });

      this.goal.on('result', (result) => {
        // this.$message(`result: ${JSON.stringify(result)}`);
        if(result.outcome=='preempted') this.$message(`任务结束！`);
        console.log('Final Result: ', result);
      });
    },

    // pose Action
    poseAction(name){
      var goalMsg = new ROSLIB.Message({
        behavior_name: 'SiteManipulation',
        arg_keys: ['site_name'],
        arg_values: [`${name}`,]
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
        // this.$message(`result: ${JSON.stringify(result)}`);
        if(result.outcome=='preempted') this.$message(`任务结束！`);
        console.log('Final Result: ', result);
      });
    },

    // 检查ros连接状态
    checkRos(){
      if(!this.ros.isConnected){
        // this.isShow = 0;
        this.$message.error('The robot is not connected. Please check the connection status before proceeding.');
      }
    },

    // 开始第一次
    start(id) {
      // 暂停继续
      if(this.goon){this.Pause();return;} 
      this.flexbeSwitch = false;
      // this.isInstall = id;
      // if (this.isInstall) this.$message(this.$t('prompt.switchMode'));
     if (id == 1) {
        this.isShow = id;
        this.isInstall = id;
        var auto = id == 1 ? false : true;
        this.$message.success('Start Installation.');
        this.sendGoal(auto, 50);
      }
      else {
        this.$prompt(this.$t('prompt.inputNum'), this.$t('prompt.prompt'), {
          confirmButtonText: this.$t('mains.confirm'),
          cancelButtonText: this.$t('mains.cancel'),
          inputPattern: /[1-9]{1}\d{0,3}/,
          inputErrorMessage: this.$t('prompt.inputErrorMessage')
        }).then(({ value }) => {
          this.isShow = id;
          this.isInstall = id;
          var auto = id == 1 ? false : true;

          this.$message.success('success: ' + value);

          // this.pvm_num = value;
          console.log(Number(value));
          this.sendGoal(auto, value);
        }).catch(() => {
          this.isInstall = 0;
          this.flexbeSwitch =true;
          this.isShow = 0;
          this.$message(this.$t('mains.cancel'));
        });
      }
    },

    // 发送goal
    sendGoal(auto, pvm_num) {

      var ls = localStorage.getItem('pvm_param')
      const { pvm } = JSON.parse(ls);

      var goalMsg = new ROSLIB.Message({
        behavior_name: 'CommInstallPVM',
        arg_keys: ['auto', 'pvm_num', 'pvm_width', 'install_gap'],
        arg_values: [`${auto}`, `${pvm_num}`, pvm.pvm_width, pvm.install_gap]
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
        if(result.outcome=='preempted') this.$message(`任务结束！`);
        // this.$message(`result: ${JSON.stringify(result)}`);
        console.log('Final Result: ', result);
      });
    },


    // 任务状态开始,暂停,继续,停止
    // 暂停
    Pause() {
      // console.log(this.flexbeSwitch);
      this.goon=1;
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
    // 停止
    Stop() {
      var stop_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/flexbe/command/preempt',
        messageType: 'std_msgs/Empty'
      });
      stop_sub.publish({});
      this.$message.success('Installation Stopped.');
      this.isInstall = 0;
      this.flexbeSwitch =true;
      this.isVideo = 0;
      this.isThree = 0;
      // this.isShow = 0;
      this.goon = 0;
    },

    // 开始video
    videoRos() {
      this.isVideo = 1;
      // 订阅 robot's site 
      this.video_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/camera/color/image_raw/compressed',
        messageType: 'sensor_msgs/CompressedImage'
      });

      this.video_sub.subscribe((msg) => {
        // console.log(msg);
        this.urlVideo = `data:image/jpeg;base64,${msg.data}`;
      })
    },

    // 停止video
    pauseRos() {
      this.isVideo = 0;
      this.video_sub.unsubscribe();
      this.urlVideo = null;
    },
  },
};
</script>

<style scoped lang="less">
.home {
  // position: relative;
  font-size: 0.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;

}

.h_outer {
  flex: 5;
  display: flex;
  justify-content: center;

  .h_inner {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    // height: 833px; 
    // justify-content: center;
    // align-items: center;

    // margin: 10% 0;
    // height: 280px;
    .btn {
      width: 200px;
      height: 200px;
      border: 1px solid #ececec;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background: #f8f8f8;

      &:hover {
        background: #e7e7e7;
      }

      i {
        font-size: 48px;
      }

      img {
        width: 72px;
        height: 72px;
      }

      span {
        margin-top: 10px;
        font-size: 16px;
      }


    }

    .l2 {
      width: 200px;
      height: 200px;
      // border: 1px solid #ececec;
      display: flex;
      flex-wrap: wrap;
      align-content: center;
      justify-content: center;
      background: #e4e4e4;

      i {
        font-size: 48px;
      }

      img {
        width: 56px;
        height: 56px;
      }

      span {
        margin-top: 10px;
        font-size: 16px;
      }

    }

    .in {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100px;
      height: 100px;

      &:hover {
        background: #dbdbdb;
        // outline: 1px solid #a8a8a8;
      }
    }
  }
}

.l2 {
  // width: 200px;
  // height: 200px;
  height: 280px;
  // border: 1px solid #ececec;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  // background: #e4e4e4;

  i {
    font-size: 48px;

  }

  img {
    width: 108px;
    height: 108px;
  }

  span {
    margin-top: 10px;
    font-size: 24px;
    font-weight: 700;
  }

}

.in {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  // border: 1px solid #212223;
  // box-shadow: 5px 5px 5px #212223;

  &:hover {
    border-radius: 5px;
    background: #535353d3;
    box-shadow: 5px 5px 20px #212223;
    // transform: scale(1.01);
    // transform: translateZ(10px);
  }
}

.kuang {
  position: fixed;
  bottom: 0%;
  background: #000000bd;
  color: #b9b9b9;
  margin-left: -10px;
  // border-radius: 10px;
  box-shadow: 0px 0px 20px 10px rgb(36 36 36 / 50%), inset 0px 5px 20px 10px rgb(100 100 100 / 50%);
  width: 100%;
  height: 250px;
  z-index: 1000;

  i {
    position: absolute;
    right: 10px;
    top: 10px;
    color: #b9b9b9;
    cursor: pointer;
    z-index: 100;

    &:hover {
      color: #d6d6d6;
    }
  }

}</style>
