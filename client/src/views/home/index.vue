<template>
  <div class="home">
    <div style="display: flex; justify-content: space-between;">
      <Tips :robotName="robotName" />
      <Tasks @winChanged="winChanged" />
    </div>

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
        <!-- <div class="btn" :title="$t('install.sai')" @click="sendTask(1)">
          <img src="./img/bauto.png" alt="">
          <span>{{ $t('install.sai') }}</span>
        </div> -->

        <!-- 自动安装 -->
        <div class="btn" :title="$t('install.fai')" @click="sendTask(0)">
          <img src="./img/auto.png" alt="">
          <span>{{ $t('install.fai') }}</span>
        </div>
      </div>
    </div>

    <!-- 开始后 -->
    <div class="kuang" :style="{ zIndex: zIndexValue }" v-show="isShow == 3 || isShow == 4">
      <i class="el-icon-close" @click="closeWin"></i>
      <!-- 机器人遥控 -->
      <div v-if="isShow == 3">
        <Telecontrol />
      </div>
      <div v-else-if="isShow == 4" class="arml2">
        <div style="color: #fff;">{{ gtoa ? $t('install.global') : $t('install.axis') }}：{{ ctof ?
          $t('install.minoradjust') : $t('install.majoradjust') }}</div>
        <div style="display: flex; align-items: center; justify-content: center;">
          <div>
            <!-- <el-switch v-model="gtoa" active-color="#ff4949" inactive-color="#13ce66"> </el-switch> -->
            <span class="armin ll" v-if="gtoa" @click="gtoa = false">{{ $t('install.axis') }}</span>
            <span class="armin ll" v-else @click="gtoa = true">{{ $t('install.global') }}</span>
            <span class="armin ll" v-if="!ctof" @click="ctof = true">{{ $t('install.minoradjust') }}</span>
            <span class="armin ll" v-else @click="ctof = false">{{ $t('install.majoradjust') }}</span>
          </div>

          <!-- 机械臂全局操控 -->
          <div class="armContent ll" v-if="gtoa" style="height: 168px;">
            <span class="armin" style="width: 200px;" @click="control(0, -0.05)"><i style="color: #67C23A;"
                class="el-icon-arrow-up"></i></span>

            <div style="display: flex;">
              <span class="armin" @click="control(0.05)"><i style="color: #F56C6C;"
                  class="el-icon-arrow-left"></i></span>
              <span class="armin" @click="control(-0.05)"><i style="color: #F56C6C;"
                  class="el-icon-arrow-right"></i></span>
            </div>
            <span class="armin" style="width: 200px;" @click="control(0, 0.05)"><i style="color: #67C23A;"
                class="el-icon-arrow-down"></i></span>

          </div>
          <div v-if="gtoa">
            <span class="armin ll" @click="control(0, 0, 0.05)"><i style="color: #409EFF;"
                class="el-icon-top"></i></span>
            <span class="armin ll " @click="control(0, 0, -0.05)"><i style="color: #409EFF;"
                class="el-icon-bottom"></i></span>
          </div>
          <div v-if="gtoa">
            <span class="armin ll" @click="control(0, 0, 0, -1)"><i style="transform: rotate(100deg)"
                class="el-icon-refresh-right"></i></span>
            <span class="armin ll " @click="control(0, 0, 0, 1)"><i style="transform: rotate(250deg)"
                class="el-icon-refresh-left"></i></span>
          </div>

          <!-- 机械臂轴控制 -->
          <div v-show="!gtoa" v-for="i in 6" :key="i" class="armContent1 ll">
            <span class="armin" @mousedown="startArm(i, 0.1)" @mouseup="stopArm" @touchstart.prevent="startArm(i, 0.1)"
              @touchend.prevent="stopArm"><i class="el-icon-arrow-up"></i></span>
            <span class="armin">{{ i }}</span>
            <span class="armin" @mousedown="startArm(i, -0.1)" @mouseup="stopArm"
              @touchstart.prevent="startArm(i, -0.1)" @touchend.prevent="stopArm"><i
                class="el-icon-arrow-down"></i></span>
          </div>

        </div>
      </div>
    </div>

    <!-- 可拖拽框 -->
    <div class="dragBox" v-show="isShow || isTask">

      <div class="row">
        <!-- 任务状态 -->
        <!-- <div class="win" v-if="taskState.id"> -->
        <div class="win">
          <div class="totitle">
            <span>{{ $t('task.taskinfo') }}</span>
            <i class="el-icon-close" style="cursor: pointer;" @click="winClose"></i>
          </div>
          <div class="contents" ref="contents">
            <div class="content">
              <div class="taskInfo">
                <div><span class="title">{{ $t('task.taskid') }}:</span>{{ taskState.id }}</div>
                <!-- <div><span class="title">{{ $t('task.taskname') }}:</span>{{ taskState.task_name }}</div> -->
                <div><span class="title">{{ $t('task.tasktype') }}:</span>{{ taskState.task_type == 0 ?
                  `${$t('install.fai')}` : taskState.task_type == 1 ? `${$t('install.sai')}` : taskState.task_type == 2
                    ?
                    `${$t('install.detach')}` : taskState.task_type == 4
                      ?
                      `${$t('config.handeye')}` : '' }}</div>
                <div><span class="title">{{ $t('task.taskprogress') }}:</span>
                  {{ (taskState.done_num / taskState.task_num).toFixed(4) * 100 || 0 }}%
                  （{{ taskState.done_num || 0 }}/{{ taskState.task_num || 0 }}）</div>
                <div><span class="title">{{ $t('task.starttime') }}:</span>{{ taskState.start_time }}</div>
                <div v-if="taskState.end_time"><span class="title">{{ $t('task.endtime') }}:</span>{{ taskState.end_time
                }}
                </div>
                <div  v-if="taskState.last_duration&&taskState.task_type !== 2">
                  <!-- <span class="title" v-if="taskState.last_duration">{{ $t('task.InstallSpeed') }}:</span> -->
                  <span class="title">{{ $t('task.InstallSpeed') }}:</span>
                  {{ taskState.last_duration }}
                  <el-button type="primary" size="mini" @click="onDialogOpened(taskState.id)">{{ $t('nav.historySpeed') }}</el-button>
                  <!-- <span @click="onDialogOpened(taskState.id)" style="color:#409EFF;text-decoration: underline; cursor:pointer"></span> -->
                </div>
                <div><span class="title">{{ $t('task.taskstep') }}:</span>{{ taskState.task_step }}</div>
                <div v-if="taskState.task_type != 4"><span class="title" >{{ $t('config.bridgegap') }}:</span><el-switch
                    v-model="robot.status" @change="upDataPVM" active-value="1" inactive-value="0"> </el-switch>
                  <el-input style="margin-left: 10px; width: 80px;" v-model="robot.bridgegap" @blur="upDataPVM"></el-input>(mm)</div>
              </div>
              <div class="right">
                <div class="tiptop">
                  <span v-if="taskState.task_status == 3">{{ $t('task.completed') }}</span>
                  <span v-if="taskState.task_status == 2">{{ $t('task.pause') }}</span>
                  <span v-if="taskState.task_status == 1">{{ $t('task.executing') }}</span>
                  <span v-if="taskState.task_status == 0">{{ $t('task.stop') }}</span>
                </div>
                <div class="btns">
                  <el-button class="btn" v-if="taskState.task_status == 2" @click="changeTask(1)">{{ $t('task.continue')
                  }}</el-button>
                  <el-button class="btn" v-if="taskState.task_status == 1" @click="changeTask(2)">{{ $t('task.pause')
                  }}</el-button>
                  <el-button class="btn" v-if="taskState.task_status == 1 || taskState.task_status == 2"
                    @click="changeTask(0)">{{ $t('task.stop') }}</el-button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- flexbe日志 -->
        <div class="win" v-if="flexbeLog">
          <div class="totitle">
            <span>{{ $t('task.tasklog') }}</span>
            <i class="el-icon-close" style="cursor: pointer;" @click="winClose"></i>
          </div>
          <div class="contents" ref="contents">
            <div class="p" v-for="l, i in flexbeLog" :key="i" style="">
              <span>[{{ l.time }}]：</span>
              <span v-if="l.status_code == 3" style="color: #F56C6C; font-weight: 600;">{{ l.text }}</span>
              <span v-if="l.status_code == 1" style="color: #E6A23C; font-weight: 600;">{{ l.text }}</span>
              <span v-if="l.status_code == 0" style="font-weight: 600;">{{ l.text }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-if="video">
        <!-- RGB图像 -->
        <div class="win" v-if="rawImg">
          <div class="totitle">
            <span>{{ $t('install.RGB') }}</span>
            <i class="el-icon-close" style="cursor: pointer;" @click="winClose"></i>
          </div>
          <div class="contents" ref="contents">
            <img :src="rawImg" alt="" style="width: 100%; height: 100%;">
          </div>
        </div>

        <!-- 深度图像 -->
        <div class="win" v-if="depImg">
          <div class="totitle">
            <span>{{ $t('install.depth') }}</span>
            <i class="el-icon-close" style="cursor: pointer;" @click="winClose"></i>
          </div>
          <div class="contents" ref="contents">
            <img :src="depImg" alt="" style="width: 100%; height: 100%;">
          </div>
        </div>

        <!-- 分割图像 -->
        <div class="win" v-if="resImg">
          <div class="totitle">
            <span>{{ $t('install.res') }}</span>
            <i class="el-icon-close" style="cursor: pointer;" @click="winClose"></i>
          </div>
          <div class="contents" ref="contents">
            <img :src="resImg" alt="" style="width: 100%; height: 100%;">
          </div>
        </div>
      </div>

    </div>

    <!-- 急停 -->
    <div class="estop">
      <div class="outer" v-if="!Estop">
        <div class="insart"></div>
        <img src="./img/estop.png" alt="" @click="estop('estop_on', true)">
      </div>
      <div class="outer" v-else>
        <div class="insart estop_off"></div>
        <img src="./img/estop.png" alt="" @click="estop('estop_off', false)">
      </div>
    </div>

    <!-- 工具箱 -->
    <div class="tool">
      <div class="outer" :style="{ height: toolbar1 ? '275px' : '50px' }">
        <div class="inner" @click="checkRos">
          <i class="el-icon-suitcase" @click="toolbar1 = !toolbar1"></i>
          <!-- <img src="./img/joy.png" alt="" @click="toolbar(3)"> -->
          <!-- <img src="./img/arm.png" alt="" @click="toolbar(4)"> -->
          <div class="box">
            <img src="./img/QRcode.png" alt="扫码安装" @click="InstallFirstTask()">
            <span>{{ $t('install.InstallFirstPVM') }}</span>
          </div>
          <div class="box">
            <img src="./img/chai.png"  alt="拆卸" @click="sendTask(2)">
            <span>{{ $t('install.detach') }}</span>
          </div>
          <div class="box">
            <img src="./img/parking.png" alt="停车位置" @click="newSendTask(3,'StartInstallCheck', {})">
            <span>{{ $t('install.StartInstallCheck') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史速率echarts -->
    <el-dialog :title="$t('nav.historySpeed')" :visible.sync="isHistorySpeed" width="80%" center
      :close-on-click-modal="false">
      <div v-loading="isLoading" :element-loading-text="$t('config.Loading')" style="min-height: 400px;">
        <div id="historySpeed-chart" style="height: 400px;"></div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Tips from "./tips";
import Telecontrol from "@/components/Telecontrol";
import { mapState } from "vuex";
import Toast from "@/components/toast";
import Tasks from "@/components/Tacks";
import { debounce } from 'lodash';
import { getRobot, updateRobot, setTaskInfo, getHistorySpeed, setLog } from '@/api';
import * as echarts from 'echarts';
import {date} from '@/utils/date';
import { Descriptions } from "element-ui";

export default {
  name: "home",
  components: { Tips, Telecontrol, Toast, Tasks },
  data() {
    return {
      isTask: false,
      toolbar1: false,
      zIndexValue: 999,
      isEstop: false,
      gtoa: false, // 全局-轴 （机械臂）
      ctof: true, // 粗调-微调（机械臂）
      isShow: 0,
      inDraging: false,
      video: Number(localStorage.getItem('video')) || 0,
      robot: {},
      robotName: "", //设备名称
      isConncect: false,  // 记录是否连接过server
      isHistorySpeed: false,
      isLoading: false,      // 防止并发请求
      chart: null,
      historySpeedData: []
    };
  },
  computed: {
    ...mapState("socket", ['rosConnect', 'Estop', 'flexbeLog', 'taskState', 'rawImg', 'depImg', 'resImg', 'databaseUpdate', 'armDep']),
  },
  mounted() {
    this.$nextTick(() => this.scrollToBottom());
    this.loop1();
    this.flexbeSwitch = JSON.parse(localStorage.getItem('flexbeSwitch'));
    this.getRobot();

    var v = localStorage.getItem('video');
    if (!v) localStorage.setItem('video', 0)
  },
  watch: {
    flexbeLog() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    databaseUpdate(val, oldval) {
      console.log(val, oldval);
      if (val) this.getRobot();
      this.$store.dispatch("socket/statusUpdate");
    },
    armDep(val) {
      console.log('armDep', val);

      if (val) this.armNotification(val);
    },
    
    taskState(val, oldval) {
      // console.log('taskState', val);
      if (val.task_status !== oldval.task_status && (val.task_status === 3 || val.task_status === 0)) {
        console.log('任务完成');
        this.winClose();
      }
  },
  rosConnect(val){
      if(val == 1){
        if(this.isConncect){
          window.location.reload();
        }else{
          this.isConncect = true;
        }
      }else{
        this.winClose();
      }
    }
},
  methods: {
    /** 弹窗打开：拉取数据 -> 初始化实例 -> 首次渲染 */
    async onDialogOpened(id) {
      console.log('onDialogOpenedid', id);

      // id = 456456456;
      this.isHistorySpeed = true;
      if (this.isLoading) return
      this.isLoading = true
      await this.getHistorySpeed(id)
      this.initChart(id)
      // this.drawChart({ useSampling: true })  // 初始抽样渲染
      this.isLoading = false
    },
    async getHistorySpeed(id) {
      console.log('getHistorySpeed');

      var res = await getHistorySpeed(id);
      console.log('res', res);
      this.historySpeedData = res.data;


    },
    /** 初始化 ECharts，仅调用一次 */
    initChart(id) {
      if (!this.chart) {
        this.chart = echarts.init(document.getElementById('historySpeed-chart'));

        const xNums = this.historySpeedData.map(item => item.num);
        const yDurations = this.historySpeedData.map(item => item.duration);

        // console.log(date(this.historySpeedData[0].time));
        
        var option = {
          title: {
            text: `ID: ${id}`
          },
          tooltip: {
            trigger: 'axis',
            formatter: params => {
              // params is an array since trigger:'axis'
              const p = params[0];
              // show num, duration and maybe time
              const idx = p.dataIndex;
              const t = this.historySpeedData[idx].time;
              return `组件：第 ${p.axisValue} 块<br/>
              速率: ${p.data.toFixed(2)} S<br/>
              时间: ${date(t)}`;
            }
          },
          legend: {
            show: false,
          },
          toolbox: {
            show: true,
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              dataView: { readOnly: false },
              magicType: { type: ['line'] },
              restore: {},
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xNums
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value} S'
            }
          },
          series: [
            {
              name: 'History Speed',
              type: 'line',
              data: yDurations,
              markPoint: {
                data: [
                  { type: 'max', name: 'Max' },
                  { type: 'min', name: 'Min' }
                ]
              },
              markLine: {
                data: [{ type: 'average', name: 'Avg' }]
              }
            },
          ]
        };

        this.chart.setOption(option);

        // 自适应容器
        window.addEventListener('resize', () => {
          this.chart.resize()
        })
      }
    },

    armNotification({ x, y, z, w, Z }) {
      const h = this.$createElement;
      this.$notify({
        title: '机械臂深度',
        duration: 3000,
        offset: 80,
        message: h('i', { style: 'color: teal' }, `X:${x} Y:${y} Z:${z} W:${w} Z:${Z}`)
      });
    },
    async getRobot() {
      var res = await getRobot();
      this.robot = res.data[0];
      this.$set(this.robot, 'status', String(this.robot.status));
      this.robotName = this.robot.robotname;
      console.log('robot status', this.robot.status);
    },
    async upDataPVM() {
      var res = await updateRobot(this.robot);
      localStorage.setItem('video', this.robot.video);

      if (res.code == 200) this.$message.success(`${this.$t('prompt.updateSuccess')}`);
      else this.$message.error(`${this.$t('prompt.updateFailed')}`);
      this.setLogInfo('warning', '参数修改', this.robot);
    },
    winChanged(val) {
      this.isTask = val;
      this.isShow = 1;
    },
    async winClose() {
      this.isTask = false;
      this.isShow = 0;
    },
    // 发送任务
    sendTask(num) {
      if (!this.rosConnect) {
        return;
      }
      var isInstall = this.taskState.task_status == 1 || this.taskState.task_status == 2;
      if (isInstall) return this.$message.error(`${this.$t('prompt.tasking')}`);
      var id = Math.round(Math.random() * 900000000 + 100000000);
      this.$prompt(this.$t('prompt.inputNum'), this.$t('prompt.prompt'), {
        confirmButtonText: this.$t('mains.confirm'),
        cancelButtonText: this.$t('mains.cancel'),
        inputPattern: /^[1-9]\d{0,2}$/,  // 三位整数
        inputErrorMessage: this.$t('prompt.inputErrorMessage')
      }).then(async ({ value }) => {
        const modeMap = { 0: 'Web_Fully-Auto', 1: 'Web_Semi-Auto', 2: 'Web_Detach' };
        var taskmsg = { id, task_status: 1, task_name: modeMap[num], task_type: num, task_num: Number(value) };
        this.$store.dispatch('socket/sendTask', taskmsg);

        var taskinfo = { id, taskId: num, task_state: 1, result: value }
        // console.log('taskinfo', taskinfo);

        var res = await setTaskInfo(taskinfo);
        console.log('res', res);

        this.$message.success('任务发送成功');
        this.isShow = 4;
        this.toolbar1 = false;
        this.setLogInfo('info', '任务下发', modeMap[num]);
      }).catch((error) => {
        console.log('sendTask error', error);
        this.$message(this.$t('mains.cancel'));
      });
    },
    // 修改任务状态
    changeTask(num) {
      var { id, task_name, task_type, task_num } = this.taskState;
      var taskmsg = { id, task_status: num, task_name, task_type, task_num };
      this.$store.dispatch('socket/sendTask', taskmsg);
      this.setLogInfo('warning', '任务操作', 'task_status:' + num);
    },
    // 操作行为记录
    async setLogInfo(level, operation_type, description){
        var loginfo = {
          device: this.robotName,
          level: level,
          time: date(new Date()),
          tag: this.robot.robot_type,
          msg: operation_type,
          description: description,
          siteId: 1
        }
        var logres = await setLog(loginfo);
        console.log('log', logres);
    },

    //新的接口任务发送
    async newSendTask(task_id ,task_name, params){
      var isInstall = this.taskState.task_status == 1 || this.taskState.task_status == 2;
      if (isInstall) return this.$message.error(`${this.$t('prompt.tasking')}`);
      var id = Math.round(Math.random() * 900000000 + 100000000);
      var taskmsg = { id, task_status: 1, task_name: task_name, task_type: 99, task_num: 1, param: JSON.stringify(params) };
      this.$store.dispatch('socket/sendTask', taskmsg);
      var taskinfo = { id, taskId: task_id, task_state: 4, result: 1 }
      // console.log('taskinfo', taskinfo);
      var res =  await setTaskInfo(taskinfo);
      console.log('res', res);
      
      this.$message.success('任务发送成功');
      this.isShow = 4;
      this.toolbar1 = false;
      this.setLogInfo('info', '任务下发', task_name);
    },
    //扫码安装任务
    InstallFirstTask(){
      if (!this.rosConnect) {
        return;
      }
      this.$confirm(this.$t('prompt.selectFirstPVM'), this.$t('prompt.prompt'), {
          confirmButtonText: this.$t('prompt.front'),
          cancelButtonText: this.$t('prompt.back'),
          distinguishCancelAndClose: true,
          type: 'info'
        }).then(() => {
          this.newSendTask(1,'InstallFirstPVM', {first_back: false});
        }).catch((val) => {
          if (val === 'close') {
            return;
          } else {
            this.newSendTask(1,'InstallFirstPVM', {first_back: true});
          }         
        });
    },
    // flexbelog滚动到底部
    scrollToBottom() {
      const contents = this.$refs.contents;
      if (contents) contents.scrollTop = contents.scrollHeight;
    },
    // 工具箱
    toolbar(num) {
      // console.log('tool');
      this.toolbar1 = false;
      this.isShow = num;
      this.zIndexValue = 9999;
    },
    // 机械臂和底盘急停
    estop(arm, base) {
      this.$message.error('急停按钮已触发');
      this.isEstop = base;
      this.$store.dispatch('socket/armEstop', arm);
      this.$store.dispatch('socket/Estop', base);
      this.setLogInfo('warning', '急停按钮', arm + base);
    },
    arm(axle, rot = 0) {
      var frame_id = 'jtc';
      if (rot && this.ctof) rot /= 5;
      var axes = Array(8).fill(0);
      axes[axle - 1] = rot;

      this.$store.dispatch("socket/control", { axes, frame_id });
    },
    startArm(axle, rot) {
      this.inDraging = true;
      this.currentAxle = axle;
      this.currentRot = rot;
      this.arm(axle, rot);
    },
    stopArm() {
      this.inDraging = false;
      var frame_id = 'jtc';
      var axes = Array(8).fill(0);

      this.$store.dispatch("socket/control", { axes, frame_id });
    },
    // 检查ros连接状态
    checkRos() {
      if (!this.rosConnect) {
        this.isShow = 0;
        this.$message.error(`${this.$t('prompt.robotNotConnected')}`);
      }
    },
    loop1() {
      requestAnimationFrame(this.loop1);

      if (this.inDraging) this.arm(this.currentAxle, this.currentRot);
    },
    //----------------------------
    // 全局控制
    control(px = 0, py = 0, pz = 0, o = 0) {
      let qw, qz;

      if (this.ctof) {
        px /= 5; py /= 5; pz /= 5;
        qw = o === 0 ? 1 : 0.9999905;
        qz = o === 0 ? 0 : 0.0043633 * o;
      } else {
        qw = o === 0 ? 1 : 0.9999619;
        qz = o === 0 ? 0 : 0.0087265 * o;
      }

      const pose = { position: { x: px, y: py, z: pz }, orientation: { x: 0, y: 0, z: qz, w: qw } };
      // console.log(pose);
      this.debouncedPublish(pose);

    },
    debouncedPublish: debounce(function (pose) {
      this.$store.dispatch("socket/globalControl", pose);
    }, 500),

    // 关闭窗口
    closeWin() {
      this.zIndexValue = 999;
      this.isShow = 0;
      this.isTask = false;
    }
  },
};
</script>

<style scoped lang="less">
.content {
  display: flex;
  justify-content: space-between;
  margin: 5px;

  .taskInfo {
    display: flex;
    flex-direction: column;
    height: 100%;

    div {
      margin: 5px;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .title {
      font-weight: 600;
      margin-right: 5px;
    }
    
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;

    .tiptop {
      font-weight: 600;
      font-size: 24px;
      margin: 10px 0;
    }

    .btns {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: baseline;

      .btn {
        margin: 5px;
      }
    }
  }
  ::v-deep .el-input__inner{
    height: 22px;
    line-height: 22px;
  }

}

.estop {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: fixed;
  top: 50%;
  left: 0;
  // background: #F56C6C;
  z-index: 9999;
  cursor: pointer;
  margin-left: 15px;

  .outer {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;

    .insart {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #E6A23C;
      z-index: 1000;
    }

    .estop_off {
      background-color: #67C23A;
    }

    img {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 5000;
      border-radius: 50%;
      box-shadow: 0 0 10px #000000a6;
      overflow: hidden;
      transition: box-shadow 0.8s ease;

      &:hover {
        box-shadow: 5px 5px 10px #000000a6;
      }
    }
  }

}

.tool {
  width: 60px;
  height: 60px;
  position: fixed;
  top: 16%;
  left: 0;
  z-index: 9999;
  cursor: pointer;
  padding-left: 20px;
  .outer {
    position: relative;
    width: 60px;
    // height: 126px;
    height: 50px;
    border-radius: 30px;
    background-color: #ffffff;
    overflow: hidden;

    .inner {
      display: flex;
      flex-direction: column;
      align-items: center;

      i {
        font-size: 40px;
        margin-top: 10px;

        &:hover {
          color: #409EFF;
        }
      }
      .box {
        width: 60px;
        height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        // background: #cccccc50;
        border-radius: 5px;
        margin-bottom: 10px;
        border: 1px solid #a0a0a03a;

        img {
          width: 36px;
          height: 36px;
          margin-top: 10px;
        }
        span {
          font-size: 14px;
        }
      }
    }

  }

}

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
      // background: rgba(0, 0, 0, 0.075);
      background: #cccccc50;
      // background: rgba(255, 255, 255, 0.103);
      border-radius: 5px;
      margin: 1px;

      &:hover {
        background: #cccccc70;
        // background: rgba(255, 255, 255, 0.164);
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
  margin: 10px;
  font-weight: 700;
  flex-direction: column;
  justify-content: center;
  align-items: center;

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
    margin: 0 10px;
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

.dragBox {
  display: flex;
  // justify-content: flex-end;
  justify-content: center;
  flex-wrap: wrap;

  .row {
    display: flex;
    // width: 90%;
    width: 80%;
  }

  .win {
    flex: 1;
    width: 50%;
    border: 1px solid #dddddd71;
    background: #cccccc50;
    font-size: 14px;
    box-shadow: 0px 0px 10px #bdbdbd61;
    overflow: hidden;
    z-index: 999;
    border-radius: 5px;

    .totitle {
      display: flex;
      justify-content: space-between;
      margin: 10px;
      font-weight: 600;
      font-size: 16px;
      // border-bottom: #000000a6 1px;
    }

    .contents {
      width: 100%;
      height: 230px;
      overflow-y: auto;
      overflow-x: hidden;
      border-top: #00000065 1px solid;

      &::-webkit-scrollbar {
        // 滚动条样式
        width: 3px;
        height: 3px;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-corner {
        background-color: transparent;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: #999999;
      }

      &::-webkit-scrollbar-track {
        border-radius: 0;
        background: #d6d6d6;
      }

      .p {
        margin: 5px 10px;
        text-overflow: ellipsis;
      }
    }
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
  // z-index: 1000;
  color: #e9e9e9;

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
