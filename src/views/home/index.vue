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
        <div class="btn" :title="$t('install.sai')" @click="isShow = 1">
          <img src="./img/bauto.png" alt="">
          <span>{{ $t('install.sai') }}</span>
        </div>

        <!-- 自动安装 -->
        <div class="btn" :title="$t('install.fai')" @click="isShow = 2">
          <img src="./img/auto.png" alt="">
          <span>{{ $t('install.fai') }}</span>
        </div>
      </div>
    </div>

    <!-- 开始后 -->
    <div class="kuang" v-show="isShow">
      <i class="el-icon-close" @click="closeWin"></i>
      <!-- 机器人遥控 -->
      <div v-if="isShow == 3">
        <Telecontrol />
      </div>
      <div v-else-if="isShow == 4" class="arml2">
        <div>
          <span class="armin ll" @click="withDraw('WithdrawPVM')">{{ $t('install.withdraw') }}</span>
          <span class="armin ll" @click="withDraw('StartInstallCheck')">{{ $t('install.check') }}</span>
        </div>

        <div class="armContent ll" style="height: 168px;">
          <span class="armin" style="width: 200px;" @click="control('Y', -10)"><i class="el-icon-arrow-up"></i></span>

          <div style="display: flex;">
            <span class="armin" @click="control('X', 10)"><i class="el-icon-arrow-left"></i></span>
            <span class="armin" @click="control('X', -10)"><i class="el-icon-arrow-right"></i></span>
          </div>
          <span class="armin" style="width: 200px;" @click="control('Y', 10)"><i class="el-icon-arrow-down"></i></span>

        </div>
        <div>
          <span class="armin ll" @click="control('Z', 10)"><i class="el-icon-top"></i></span>
          <span class="armin ll " @click="control('Z', -10)"><i class="el-icon-bottom"></i></span>
        </div>
        <div>
          <span class="armin ll " @click="poseAction('armInitPose')">{{ $t('install.reset') }}</span>
          <span class="armin ll" @click="Stop()" style="background-color: #F56C6C;color: #ffffff;">{{ $t('install.stop')
          }}</span>
        </div>
      </div>
      <!-- 安装 -->
      <div class="l2" v-else>
        <!-- <div class="in" :title="$t('install.monitor')" @click="videoRos()">
          <img src="./img/video1.png" alt="">
          <span>{{ $t('install.monitor') }}</span>
        </div> -->

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
        <!-- <div class="in" :title="$t('install.model')" @click="isThree = 1">
          <img src="./img/3d.png" alt="">
          <span>{{ $t('install.model') }}</span>
        </div> -->
      </div>
    </div>

    <!-- 可拖拽框 -->
    <div style="display: flex;" v-if="isVideo || isThree">
      <div class="win" v-if="isVideo">
        <div class="totitle">
          <span>{{ $t('install.monitor') }}</span>
          <i class="el-icon-close" style="cursor: pointer;" @click="pauseRos()"></i>
        </div>

        <img v-if="!urlVideo" src="./img/empty.png" alt="" style="width: 55%; overflow: hidden; margin: 0 auto;">
        <img v-else :src="urlVideo" alt="" style="width: 100%; height:100%; overflow: hidden;">
      </div>
      <div class="win" v-if="isThree">
        <div class="totitle">
          <span>{{ $t('install.model') }}</span>
          <i class="el-icon-close" style="cursor: pointer;" @click="isThree = 0"></i>
        </div>
        <Three v-if="isThree" style="width: 49%; height:44%;" />
      </div>
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
      goon: 0
    };
  },
  computed: {
    ...mapState("ros", ["ros",]),
  },
  mounted() {
    // this.$message.success('Installation Completed');
  },
  methods: {
    // 检查ros连接状态
    checkRos() {
      if (this.isShow) {
        this.videoRos();
        this.isThree = 1;
      }
      if (!this.ros.isConnected) {
        // this.isShow = 0;
        this.$message.error('The robot is not connected. Please check the connection status before proceeding.');
      }
    },

    // control
    control(axis, offset) {
      var goalMessage = new ROSLIB.Message({
        behavior_name: 'TransManipulation',
        arg_keys: ['axis', 'offset'],
        arg_values: [`${axis}`, `${offset}`]
      });

      this.actionClient(goalMessage);
    },

    // pose Action
    poseAction(name) {
      var goalMessage = new ROSLIB.Message({
        behavior_name: 'SiteManipulation',
        arg_keys: ['site_name'],
        arg_values: [`${name}`,]
      });

      this.actionClient(goalMessage);
    },

    // withDraw
    withDraw(name) {
      var goalMessage = new ROSLIB.Message({
        behavior_name: name,
      });

      this.actionClient(goalMessage);
    },

    // 开始第一次
    start(id) {
      // 暂停继续
      if (this.goon) { this.Pause(); return; }
      this.flexbeSwitch = false;
      // this.isInstall = id;
      // if (this.isInstall) this.$message(this.$t('prompt.switchMode'));
      if (id == 1) {
        this.isShow = id;
        this.isInstall = id;
        var auto = id == 1 ? false : true;
        this.$message.success('Start Installation.');
        this.CommInstall(auto, 50);
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
          this.CommInstall(auto, value);
        }).catch(() => {
          this.isInstall = 0;
          this.flexbeSwitch = true;
          this.isShow = 0;
          this.$message(this.$t('mains.cancel'));
        });
      }
    },

    // 发送goal
    CommInstall(auto, pvm_num) {

      var ls = localStorage.getItem('pvm_param')
      const { pvm_width,install_gap } = JSON.parse(ls);

      var goalMessage = new ROSLIB.Message({
        behavior_name: 'CommInstallPVM',
        arg_keys: ['auto', 'pvm_num', 'pvm_width', 'install_gap'],
        arg_values: [`${auto}`, `${pvm_num}`, `${pvm_width}`, `${install_gap}`]
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
      // this.goal.send();

      this.goal.on('feedback', (feedback) => {
        // this.$message(`feedback: ${JSON.stringify(feedback)}`);
        console.log('Feedback: ', feedback);
      });

      this.goal.on('result', (result) => {
        // this.$message(`result: ${JSON.stringify(result)}`);
        if (result.outcome == 'preempted') this.$message(`任务结束！`);
        console.log('Final Result: ', result);
      });
    },

    // 任务状态开始,暂停,继续,停止
    // 暂停
    Pause() {
      // console.log(this.flexbeSwitch);
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
      this.flexbeSwitch = true;
      // this.isVideo = 0;
      // this.isThree = 0;
      // this.isShow = 0;
      this.goon = 0;
    },

    // 开始video
    videoRos() {
      this.isVideo = 1;
      // 订阅 topic
      this.video_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/camera/color/image_raw/compressed',
        messageType: 'sensor_msgs/CompressedImage'
      });

      // this.video_sub = new ROSLIB.Topic({
      //   ros: this.ros,
      //   name: '/compressed_raw_base64',
      //   messageType: 'std_msgs/String'
      // });

      this.video_sub.subscribe((msg) => {
        // console.log(msg);
        this.urlVideo = `data:image/jpeg;base64,${msg.data}`;
        // console.log(this.urlVideo);
      })
    },

    // 停止video
    pauseRos() {
      this.isVideo = 0;
      this.video_sub.unsubscribe();
      this.urlVideo = null;
    },

    // 关闭窗口
    closeWin() {
      this.isShow = 0;
      this.isThree = 0;
      this.pauseRos();
    }
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
    font-weight: 700;

    .btn {
      width: 200px;
      height: 200px;
      // border: 1px solid #a0a0a03a;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.103);
      border-radius: 5px;
      margin: 1px;

      &:hover {
        background: rgba(255, 255, 255, 0.164);
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

  }
}

.l2 {
  height: 280px;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;

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

  &:hover {
    border-radius: 5px;
    background: #535353d3;
    box-shadow: 5px 5px 20px #212223;
  }
}



.arml2 {
  height: 240px;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: center;
  margin: 10px;

  .ll {
    border-radius: 5px;
    background: #535353d3;
    box-shadow: 5px 5px 20px #212223;
    overflow: hidden;
  }

  .armContent {
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .armin {
      border-radius: 0px;
      width: 100px;
      height: 56px;
      margin: 0;
    }
  }

  i {
    font-size: 48px;
  }

  img {
    width: 108px;
    height: 108px;
  }

  span {
    margin: 10px;
    font-size: 24px;
    font-weight: 700;
    width: 120px;
    height: 80px;
    // border-radius: 5px;
    background: #535353d3;
    // box-shadow: 5px 5px 20px #212223;
  }

}

.armin {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // width: 200px;
  // height: 200px;
  cursor: pointer;

  &:active {
    // border-radius: 5px;
    // background: #3b3b3bd3;
    opacity: 0.8;
    // box-shadow: 5px 5px 20px #212223;
  }
}

.win {
  width: 50%;
  height: 35%;
  border: 1px solid #dddddd71;
  // background: #ffffffe1;
  font-size: 14px;
  box-shadow: 0px 0px 10px #bdbdbd61;
  overflow: hidden;
  z-index: 999;
  border-radius: 5px;

  .totitle {
    display: flex;
    justify-content: space-between;
    margin: 5px;
  }
}

.kuang {
  position: fixed;
  bottom: 0%;
  background: #000000bd;
  margin-left: -10px;
  // border-radius: 10px;
  box-shadow: 0px 0px 20px 10px rgb(36 36 36 / 50%), inset 0px 5px 20px 10px rgb(100 100 100 / 50%);
  width: 100%;
  height: 250px;
  z-index: 1000;

  .el-icon-close {
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

}
</style>
