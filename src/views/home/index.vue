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
          <!-- <el-switch v-model="gtoa" active-color="#ff4949" inactive-color="#13ce66"> </el-switch> -->
          <span class="armin ll" v-if="gtoa" @click="gtoa = false">{{ $t('install.axis') }}</span>
          <span class="armin ll" v-else @click="gtoa = true">{{ $t('install.global') }}</span>
          <span class="armin ll" v-if="ctof" @click="ctof = false">{{ $t('install.majoradjust') }}</span>
          <span class="armin ll" v-else @click="ctof = true">{{ $t('install.minoradjust') }}</span>
        </div>
        <div>
          <span class="armin ll" @click="withDraw('WithdrawPVM')">{{ $t('install.withdraw') }}</span>
          <span class="armin ll" @click="withDraw('StartInstallCheck')">{{ $t('install.check') }}</span>
        </div>

        <!-- 机械臂全局操控 -->
        <div class="armContent ll" v-if="gtoa" style="height: 168px;">
          <span class="armin" style="width: 200px;" @click="control('Y', -10)"><i class="el-icon-arrow-up"></i></span>

          <div style="display: flex;">
            <span class="armin" @click="control('X', 10)"><i class="el-icon-arrow-left"></i></span>
            <span class="armin" @click="control('X', -10)"><i class="el-icon-arrow-right"></i></span>
          </div>
          <span class="armin" style="width: 200px;" @click="control('Y', 10)"><i class="el-icon-arrow-down"></i></span>

        </div>
        <div v-if="gtoa">
          <span class="armin ll" @click="control('Z', 10)"><i class="el-icon-top"></i></span>
          <span class="armin ll " @click="control('Z', -10)"><i class="el-icon-bottom"></i></span>
        </div>
        <!-- -------- -->

        <!-- 机械臂轴控制 -->
        <div v-show="!gtoa" v-for="i in 6" :key="i" class="armContent1 ll">
          <span class="armin" @mousedown="arm(i, 0.1)" @touchstart.prevent="arm(i, 0.1)"><i
              class="el-icon-arrow-up"></i></span>
          <span class="armin">{{ i }}</span>
          <span class="armin" @mousedown="arm(i, -0.1)" @touchstart.prevent="arm(i, -0.1)"><i
              class="el-icon-arrow-down"></i></span>
        </div>

        <div>
          <span class="armin ll " @click="poseAction('armInitPose')">{{ $t('install.reset') }}</span>
          <span class="armin ll" id="stop" @click="Stop()">{{ $t('install.stop')
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
    <div style="display: flex; justify-content: center;" v-if="isVideo || isThree">
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
      gtoa: false, // 全局-轴 （机械臂）
      ctof: false, // 粗调-微调（机械臂）
      isShow: 0,
      isInstall: 0,
      isVideo: 0,
      isThree: 0,
      urlVideo: null,
      video_sub: null,
      flexbeSwitch: true,
      pvm_num: 50,
      goal: null,
      goon: 0,
      pvm_length: '2123',
      pvm_width: '1123',
      install_gap: 10,
      message: {
        header: { frame_id: 'jtc' },
        axes: [0, 0, 0, 0, 0, 0, 0, 0],
        buttons: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      publisher: null,
      zAixs: 0
    };
  },
  computed: {
    ...mapState("ros", ["ros", 'flexbeParams']),
  },
  mounted() {
    this.avoidanceEcho();

    this.publisher = new ROSLIB.Topic({
      ros: this.ros,
      name: "joy",
      messageType: "sensor_msgs/Joy",
    });
    // this.test()
    // this.$message.success('Installation Completed');
  },
  methods: {
    arm(axle, rot = 0) {
      if (rot && this.ctof) rot /= 5;
      console.log(axle, rot);
      this.message.axes = Array(8).fill(0);
      this.message.axes[axle - 1] = rot;
      // console.log(this.message);
      this.publisher.publish(this.message);
    },
    // 检查ros连接状态
    checkRos() {
      if (this.isShow) {
        this.videoRos();
        // this.isThree = 1;
      }
      if (!this.ros.isConnected) {
        this.isShow = 0;
        this.$message.error('The robot is not connected. Please check the connection status before proceeding.');
      }
    },

    // 筛选flexbe参数
    filterParam(name) {
      try {
        var params = this.flexbeParams[name];
        if (!params) return { arg_keys: [], arg_values: [] };

        return { arg_keys: Object.keys(params), arg_values: Object.values(params) }
      } catch (error) {
        return { arg_keys: [], arg_values: [] };
      }
    },
    // test
    // test() {
    //   var {arg_keys, arg_values} = this.filterParam('test_flexbe_param2');
    //   var goalMessage = new ROSLIB.Message({
    //     behavior_name: 'test_flexbe_param2',
    //     arg_keys,
    //     arg_values
    //   });
    //   console.log(goalMessage);

    //   this.actionClient(goalMessage);
    // },

    // control
    control(axis, offset) {
      if (offset && this.ctof) offset /= 5;
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
      if (name == 'StartInstallCheck') this.checkZaixs(goalMessage)
      else this.actionClient(goalMessage);
    },

    checkZaixs(goalMessage) {
      var f = 1
      // console.log(1);
      var publisher = new ROSLIB.Topic({
        ros: this.ros,
        name: "arm_pose",
        messageType: "geometry_msgs/Pose",
      });

      publisher.subscribe((msg) => {
        this.zAixs = msg.position.z;
        if (f == 1) {

          if (this.zAixs > 1) this.actionClient(goalMessage);
          else this.$message('请抬高机械臂,末端高度为：' + this.zAixs);
        }
        f = 0
      })

      // this.$nextTick(()=>{
      //   if (this.zAixs > 1) this.actionClient(goalMessage);
      //   else this.$message('请抬高机械臂,末端高度为：'+this.zAixs);
      // })



    },

    // 开始第一次
    start(id) {
      // 暂停继续
      if (this.goon) { this.Pause(); return; }
      this.flexbeSwitch = false;
      // this.isInstall = id;
      // if (this.isInstall) this.$message(this.$t('prompt.switchMode'));
      if (id == 1) {
        // this.isShow = id;
        this.isInstall = id;
        var isauto = id == 1 ? false : true;
        this.$message.success('Start Installation.');
        this.CommInstall(isauto, 50);
      }
      else if (id == 2) {
        this.$prompt(this.$t('prompt.inputNum'), this.$t('prompt.prompt'), {
          confirmButtonText: this.$t('mains.confirm'),
          cancelButtonText: this.$t('mains.cancel'),
          inputPattern: /^\+?[1-9]\d{0,2}$/,  // 三位整数
          inputErrorMessage: this.$t('prompt.inputErrorMessage')
        }).then(({ value }) => {
          // this.isShow = id;
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
          this.isVideo = 0;
          this.isThree = 0;
          this.$message(this.$t('mains.cancel'));
        });
      }
    },

    avoidanceEcho() {
      var pvsize_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/robot_state',
        messageType: 'std_msgs/String'
      });

      pvsize_sub.subscribe((msg) => {
        msg = JSON.parse(msg.data);
        console.log(msg);
        // this.autocross = msg.dynparam.cmd_vel_filter.filter_enabled;
        this.pvm_length = msg.parameter.pvm_length;
        this.pvm_width = msg.parameter.pvm_width;
        this.install_gap = msg.parameter.install_gap;

        var pvm_param = { pvm_width: this.pvm_width, install_gap: this.install_gap };
        localStorage.setItem('pvm_param', JSON.stringify(pvm_param));
      })
    },

    // 发送goal
    CommInstall(auto, pvm_num) {
      var { arg_keys, arg_values } = this.filterParam('CommInstallPVM');

      var goalMessage = new ROSLIB.Message({
        behavior_name: 'CommInstallPVM',
        arg_keys: ['auto', 'pvm_sum', ...arg_keys],
        arg_values: [`${auto}`, `${pvm_num}`, ...arg_values]
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
        if (result.outcome == 'finished'){
          this.isInstall = 0;
          this.$message.success(`task finished !`);
        } 
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
      // this.video_sub = new ROSLIB.Topic({
      //   ros: this.ros,
      //   name: '/camera/color/image_raw/compressed',
      //   messageType: 'sensor_msgs/CompressedImage'
      // });

      this.video_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/compressed_raw_base64',
        messageType: 'std_msgs/String'
      });

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
    // box-shadow: 5px 5px 20px #212223;
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

      &:active {
        background: #3b3b3bd3;
      }
    }
  }

  .armContent1 {
    margin: 0 1px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .armin {
      border-radius: 0px;
      width: 60px;
      height: 56px;
      margin: 0;

      &:active {
        background: #3b3b3bd3;
      }
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

#stop {
  background-color: #F56C6C;
  color: #ffffff;

  &:active {
    background-color: #f73333;
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
    background: #3b3b3bd3;
    // opacity: 1.5;
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
