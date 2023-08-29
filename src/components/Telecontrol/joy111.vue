<template>
  <div class="joys">
    <!-- 前后 -->
    <div class="page">
      <!-- <div style="margin-top: 100px; margin-left: 50%; position: relative"> -->
      <!-- 触摸识别区域部分 -->
      <!-- <div
        class="toucharea"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchcancel="onTouchEnd"
        @touchend="onTouchEnd"
        @touchmove.prevent 
        @mousewheel.prevent
      ></div> -->

      <div class="wapper">
        <div class="left">
          <div class="box">
            吸
          </div>
          <div class="box">
            放
          </div>
        </div>

        <div class="center">
          <div class="c_top">
            <!-- <el-button class="c_text" @click="reset" disabled>复 位</el-button> -->
            <el-button class="c_text" @click="reset" >复 位</el-button>
            <el-button class="c_text" @click="choosePV">拆 卸</el-button>
            <div class="c_text" @click="simInstall">安 装</div>
          </div>
          <div class="c_down">

            <div :class="['slider', current == inx ? 'active' : ' ']" @click="active(inx)" v-for="i, inx in axles">
              <div class="line_c"></div>
              <!-- <div v-if="i.val>0"> -->
              <!-- <span  class="l_text" :style="{top:(i.val+180)/3.6+'%'}">{{i.val}}<div class="line" :style="{top:(i.val+180)/3.6+'%'}"></div></span> -->
              <!-- </div> -->
              <!-- <div v-else class="line" :style="{top:(i.val+180)/3.6+'%'} "><span class="l_text" :style="{top:(i.val+180)/3.6+'%'}">{{i.val}}</span></div> -->
              <div class="line" :style="{ top: (i.val + 180) / 3.6 - 0.5 + '%' }"><span class="l_text">{{ i.val }}</span>
              </div>
              <!-- <div class="line" :style="{top:'99%'} "><span class="l_text" >{{i.val}}</span></div> -->
            </div>
          </div>

        </div>

        <div class="right">
          <div class="box" @click="increase">
            <i class="el-icon-plus"></i>
          </div>
          <div class="box" @click="decrease">
            <i class="el-icon-minus"></i>
          </div>
        </div>
      </div>
      <!-- </div> -->
    </div>

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

    
    <!-- <el-dialog title="提示" :visible.sync="dialogVisible" width="80%" :before-close="handleClose" center
      :append-to-body='true'>
      <span>是否继续安装?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="putBack">放 回</el-button>
        <el-button type="primary" @click="installPV">安 装</el-button>
      </span>
    </el-dialog> -->

  </div>
</template>
 
<script>
import { mapState } from 'vuex';
var startLeft, startTop;
// 两点之间的距离函数
var getDistance = function (x1, y1, x2, y2) {
  // 手指滑动的距离取绝对值Math.abs
  var _x = Math.abs(x1 - x2);
  var _y = Math.abs(y1 - y2);
  // Math.sqrt求平方根
  return Math.sqrt(_x * _x + _y * _y);
};
export default {
  props: ["stop", 'velocity'],
  data() {
    return {
      axles: [{ val: 180 }, { val: 0 }, { val: 106.8 }, { val: -32.6 }, { val: 0 }, { val: -180 }],
      goalMsg: {
        behavior_name: 'CommInstallPVM'
      },
      dialogVisible: false,
      current: 0,
      beetleLeft: 0, //旋转方向
      beetleTop: 0, //旋转方向
      Rotate: 0, //摇杆旋转角度
      touchRadius: 100, //触摸识别区域的半径
      ballMoveRadius: 50, //杆头的移动范围半径
      transition: false,
      left: 0, //摇杆图标显示位置
      top: 0,
      stickHeight: 0, //两点之间的距离 （斜边）
      angle: 0, //两点之间旋转的夹角
      inDraging: false,
      // taskState:""
      timer:null,
    };
  },
  mounted() {
    // 禁用双指放大
    document.documentElement.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    this.loop();
  },
  computed: {
    ...mapState('ros', ['ros']),
  },
  created() {
    this.timer = setInterval(this.dialog, 3000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    // 开启弹框
    dialog(){
      // var taskState = this.$store.state.ros.taskState
      // console.log(taskState);
        
      // if (typeof taskState == 'undefined') return;
      // if (taskState.indexOf('UI') != -1 && !this.dialogVisible){
      //   console.log(1);
      //   this.dialogVisible = true;
      // } 
      // else if(taskState.indexOf('UI') == -1 && this.dialogVisible) setTimeout(()=>{ this.dialogVisible = false;}, 2000);
      
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
    simInstall() {
      console.log('模拟安装');
      var actionClient = new ROSLIB.ActionClient({
        ros: this.ros,
        actionName: 'flexbe_msgs/BehaviorExecutionAction',
        serverName: '/flexbe/execute_behavior'
      });

      this.goal = new ROSLIB.Goal({
        actionClient: actionClient,
        goalMessage: this.goalMsg
      });

      this.goal.send();

      this.goal.on('feedback', (feedback) => {
        // this.$message(`feedback: ${JSON.stringify(feedback)}`);
        console.log('Feedback: ', feedback.current_state);

        this.$bus.$emit('tasking', feedback.current_state)
      }); 

      this.goal.on('result', (result) => {
        this.$message(`result: ${JSON.stringify(result)}`);
        console.log('Final Result: ', result);
      });
    },
    // 复位
    reset() {
      console.log('复位');
      // this.dialogVisible = true;
      var actionClient = new ROSLIB.ActionClient({
        ros: this.ros,
        actionName: 'flexbe_msgs/BehaviorExecutionAction',
        serverName: '/flexbe/execute_behavior'
      });

      this.goal = new ROSLIB.Goal({
        actionClient: actionClient,
        goalMessage:  {behavior_name: 'GoHome'},
      });

      this.goal.send();

      this.goal.on('feedback', (feedback) => {
        // this.$message(`feedback: ${JSON.stringify(feedback)}`);
        console.log('Feedback: ', feedback.current_state);
      }); 

      this.goal.on('result', (result) => {
        this.$message(`result: ${JSON.stringify(result)}`);
        console.log('Final Result: ', result);
      });

    },
    // 选择
    choosePV(){
      console.log('选择');
      this.dialogVisible = true;
    },
    active(inx) {
      this.current = inx;
      console.log(inx);
    },
    increase() {
      this.axles[this.current].val += 1;
      console.log(this.axles[this.current].val);
    },
    decrease() {
      this.axles[this.current].val -= 1;
      console.log(this.axles[this.current].val);
    },
    // 
    loop() {
      // 此方法可以将回调函数追加到动画帧请求回调函数列表的末尾。
      // 当执行requestAnimationFrame(callback)时候，不会立刻调用callback函数，只是将其放入队列。
      requestAnimationFrame(this.loop);

      if (this.inDraging) {
        var lin = Number((-this.top / 50).toFixed(1));
        var ang = Number((-this.left / 100).toFixed(1));
        this.velocity(lin, ang);
      }
    },

    /**参数说明 angle 旋转的角度 direction X Y 两个邻边  power 两点之间的距离比上最大摇杆移动距离*/
    // // 手指触摸屏幕事件
    // onTouchStart(e) {
    //   var curTouch = e.targetTouches[0];

    //   // 获取触摸坐标
    //   // startLeft = curTouch.clientX - this.left;
    //   startTop = curTouch.clientY - this.top;
    //   this.inDraging = true;
    // },
    // // 手指在屏幕上滑动事件
    // onTouchMove(e) {
    //   var curTouch = e.targetTouches[0];
    //   // 相当于两个点的距离公式中 x2-x1 y2-y1
    //   // var tleft = curTouch.clientX - startLeft;
    //   var tleft = 0;
    //   var ttop = curTouch.clientY - startTop;
    //   // 两点之间的距离函数算出斜边距离
    //   var distance = getDistance(tleft, ttop, 0, 0);
    //   // var distance = getDistance(0, ttop, 0, 0);
    //   // 限制移动范围
    //   if (distance >= this.ballMoveRadius) distance = this.ballMoveRadius;
    //   // 移动的夹角Math.atan2 当前坐标移动到目标坐标 之间的夹角
    //   var angle = Math.atan2(ttop - 0, tleft - 0);
    //   // 知道夹角和斜边 计算出 两个邻边
    //   // this.left = Math.cos(angle) * distance;
    //   this.top = Math.sin(angle) * distance;
    //   // 斜边移动的角度赋值
    //   this.stickHeight = distance;
    //   this.angle = angle;
    // },

    // // 手指离开事件
    // onTouchEnd(e) {
    //   // 摇杆返回原来位置
    //   this.stickHeight = this.top = 0;
    //   this.inDraging = false;
    //   if (!this.inDraging) this.stop();
    // },

  },
};
</script>
 
<style lang="less" scoped>
.page {

  margin-left: 0px;
}

.wapper {
  display: flex;
  justify-content: space-between;
}

.box {
  width: 80px;
  height: 80px;
  margin: 0 0 30px 0px;
  background: #b8b8b815;
  color: #f0f0f0;
  opacity: 0.8;
  display: flex;
  font-size: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.box,
.c_text,
.slider {
  cursor: pointer;
  transition: all 0.2s ease-out;
  box-shadow: 0px 0 10px 2px rgba(155, 227, 255, 0.3), 0px 0 10px 2px rgba(107, 120, 129, 0.3);

  &:hover {
    transform: translate(-1px, -1px);
    transition: all 0.2s ease-out;
    box-shadow: 0px 0 15px 2px rgba(155, 255, 213, 0.6), 0px 0 15px 2px rgba(107, 129, 116, 0.6);
  }
}

.active {
  transform: translate(-1px, -1px);
  transition: all 0.2s ease-out;
  box-shadow: 0px 0 15px 2px rgba(155, 255, 213, 0.6), 0px 0 15px 2px rgba(107, 129, 116, 0.6);
}

.center {
  display: flex;
  flex-direction: column;

  .c_top,
  .c_down {
    display: flex;
    justify-content: space-around;
    margin: 5px;
  }

  .c_top {
    margin-bottom: 10px;

    .c_text {
      color: #f0f0f0;
      background-color: #b8b8b815;
      border: 0;
      font-size: 20px;
      border-radius: 10px;
      padding: 5px 10px;
    }
  }

  .slider {
    position: relative;
    width: 28px;
    height: 160px;
    background: #b8b8b815;
    border-radius: 20px;
    margin: 0 10px;
    overflow: hidden;

    .line {
      position: absolute;
      top: 50%;
      align-self: center;
      width: 100%;
      height: 1px;
      background-color: #faf62e;

    }

    .line_c {
      position: absolute;
      top: 50%;
      align-self: center;
      width: 100%;
      height: 1px;
      background-color: #d4d4d43a;

    }

    .l_text {
      position: absolute;
      font-size: 12px;
      color: #fff;
      text-align: center;
      width: 100%;
      // line-height: 120px;
    }
  }
}

.joys {
  width: 100%;
  display: flex;
  /* align-items: center;
  justify-content: center; */
}

.page {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  // padding: 40px;
}

div {
  box-sizing: border-box;
}

.toucharea {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.ball {
  position: absolute;
  z-index: 3;
  transform: translate(-50%, -50%);
}

.bian {
  position: absolute;
  width: 250px;
  height: 250px;
  z-index: 99;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.stick {
  position: absolute;
  z-index: 2;
}

.ball.animation {
  transition: left 0.1s ease-out, top 0.1s ease-out;
}

.stick.animation {
  transition: all 0.2s ease-out;
}

.bottom {
  position: absolute;
  z-index: 1;
  transform: translate(-50%, -50%);
}
</style>