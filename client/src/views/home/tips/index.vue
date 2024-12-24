<template>
  <div class="tips">
    <div class="left">
      <!-- 机器人id -->
      <div>

        <div class="jqr_id" v-if="!ros.isConnected" style="color: #f56c6c;">
          {{ $t('robot.notconnect') }}
          <el-button @click="reconnect()" type="info" size="small">
            {{ $t('robot.reconnect') }}
          </el-button>
        </div>

        <div v-else class="left_info" @click="robotDialogVisible = true">
          <div class="jqr_id">{{ regexip(ros.socket.url) }}</div>

          <div class="jqr_id" style="color: #34a94d;">{{ $t('robot.connected') }}</div>

          <!-- 电池 -->
          <Battery :quantity="Number(battery_msg.soc)" />

          <!-- 信号 -->
          <Signal :num="Number(wifi.signal)" />

          <div style="margin-right: 10px">
            <!-- {{ diagnosticstatus }} -->
            <i class="el-icon-question" v-if="diagnosticstatus == 3" style="color: #f56c6c"></i>
            <i class="el-icon-error" v-else-if="diagnosticstatus == 2" style="color: #f56c6c"></i>
            <i class="el-icon-warning" v-else-if="diagnosticstatus == 1" style="color: #e6a23c"></i>
            <i class="el-icon-success" v-else style="color: #67c23a"></i>
          </div>
          <div class="jqr_id">{{ $t('robot.speed') }}：{{ linear }} m/s</div>
          <div class="jqr_id">{{ angular }} rad/s</div>
        </div>
      </div>

      <!-- 机器人弹框 -->
      <el-dialog :title="$t('robot.robotinfo')" :visible.sync="robotDialogVisible" width="80%" center
        :close-on-click-modal="true">
        <!-- <span @click="allDevice">全部诊断>></span> -->

        <el-table stripe :data="robotData" border style="width: 100%">
          <!-- <el-table-column type="selection" width="50"></el-table-column> -->
          <el-table-column prop="id" :label="$t('robot.robotid')">
            <div class="jqr_id">{{ regexip(ros.socket.url) }}</div>
          </el-table-column>
          <el-table-column prop="state" :label="$t('robot.connect')">
            <div class="jqr_id" v-if="ros.isConnected" style="color: #34a94d;">{{ $t('robot.connected') }}</div>
            <div class="jqr_id" v-else style="color: #f56c6c;">{{ $t('robot.notconnect') }}</div>
          </el-table-column>
          <el-table-column prop="battery" :label="$t('robot.battery')">
            <div class="signal-div">
              <Battery :quantity="Number(battery_msg.soc)" rotate="-90" />
              <div>
                <i style="color: #64b4ff;">V </i>{{ battery_msg.voltage }} V<br />
                <i style="color:#64e1b4">A </i>{{ battery_msg.current }} A
              </div>
            </div>
          </el-table-column>
          <el-table-column prop="state" :label="$t('robot.network')">
            <div class="signal-div">
              <Signal :num="Number(wifi.signal)" />
              <div>
                <i class="el-icon-sort-up" style="color: #64b4ff;"></i>{{ wifi.upspeed }}MB/s<br />
                <i class="el-icon-sort-down" style="color:#64e1b4"></i>{{ wifi.downspeed }}MB/s
              </div>
            </div>
          </el-table-column>
          <!-- <el-table-column prop="location" label="定位"></el-table-column> -->
        </el-table>
        <!-- {{ diagnosticlist }} -->
        <div style="display: flex; flex-wrap: wrap;justify-content: space-between">
          <div v-for="(d, index) of diagnosticlist" :key="index"
            style="border: #ebeef5 1px solid; margin: -1px 0 0 -1px; padding: 20px 50px; width: 50%; display: flex">
            <span v-if="d.value == 3"><i class="el-icon-question" style="color: #f56c6c; margin-right: 10px"></i></span>
            <span v-else-if="d.value == 2"><i class="el-icon-error"
                style="color: #f56c6c; margin-right: 10px"></i></span>
            <span v-else-if="d.value == 1"><i class="el-icon-warning"
                style="color: #e6a23c; margin-right: 10px"></i></span>
            <span v-else><i class="el-icon-success" style="color: #67c23a; margin-right: 10px"></i></span>
            {{ d.key }}
            <br />
          </div>
        </div>
        <!-- <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="robotDialogVisible = false">{{ $t('mains.cancel') }}</el-button>
          <el-button type="primary" @click="robotDialogVisible = false">
            {{ $t('mains.confirm') }}
          </el-button>
        </span> -->
      </el-dialog>

      <!-- 地图弹框 -->
      <el-dialog :title="$t('map.selectmap')" :visible.sync="mapDialogVisible" width="80%" center>
        <!-- 地图缩略图 -->
        <div class="demo-image__preview">
          <el-radio-group v-model="map2" text-color="#66b1ff" fill="#ebeef5">
            <div class="map_list" v-for="i in map1" :key="i.id">
              <el-radio-button :label="i.name">
                <div class="map_name">
                  <el-image style="width: 120px; height: 120px" :src="i.url">
                  </el-image>
                  <div class="iname">{{ i.name }}</div>
                </div>
              </el-radio-button>
            </div>
          </el-radio-group>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="mapDialogVisible = false">{{ $t('mains.cancel') }}</el-button>
          <el-button type="primary" @click="map_name()">{{ $t('mains.confirm') }}</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 右边 -->
    <div class="right">
      <!-- 任务 -->
      <Tasks />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Battery from "@/components/Battery";
import Signal from "@/components/Signal";
import Tasks from "@/components/Tacks";
import deviceDiagnostic from "@/components/deviceDiagnostic";
export default {
  name: "home",
  components: { Signal, Battery, Tasks, deviceDiagnostic },
  data() {
    return {
      uname: {
        robotinfo: this.$t('robot.robotinfo'),
      },
      robotData: [
        {
          id: "AZRobot_001",
          battery: "0",
          state: "Connected",
        },
      ],
      map2: null,
      map1: [
        {
          id: "001",
          name: "map_ostream_display",
          url: "/img/map/map_display.png",
        },
        {
          id: "002",
          name: "map_ostream",
          url: "/img/map/map.png",
        },
        {
          id: "003",
          name: "map_ostream_path",
          url: "/img/map/map_path.png",
        },
      ],
      mapDialogVisible: false,
      robotDialogVisible: false,
      taskDialogVisible: false,
      deviceDialogVisible: false,
      battery_msg: {
        current: '0',
        voltage: '0',
        soc: '60'
      },
      angular: '0',
      linear: '0',
    };
  },
  computed: {
    ...mapState("ros", [
      'ros',
      "diagnostics",
      "Device",
      'wifi',
      'diagnosticlist',
      'diagnosticstatus',
    ]),
    // ...mapGetters("ros", ['wifi']),
  },
  mounted() {
    this.map_name();
    this.battery();
    this.speed();
    if (navigator.connection) {
      console.dir(navigator.connection);
      const downlink = navigator.connection.downlink;
      console.log(`当前下载速度: ${downlink} Mbps`);
    } else {
      console.log("Network Information API 不被支持");
    }

  },
  methods: {

    reconnect() {
      this.$message(`${this.$t('connPrompt.reconn')}...`);
      this.$bus.$emit('reconn')
    },
    regexip(ws) {
      const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
      return ws.match(regex)[1];
    },

    // 速度
    speed() {
      var rosTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: "odom",
        messageType: "nav_msgs/Odometry",
      });

      rosTopic.subscribe((msg) => {
        this.angular = (msg.twist.twist.angular.z).toFixed(1);
        this.linear = (msg.twist.twist.linear.x).toFixed(1);
        // console.log(msg.twist.twist.angular.z);
        // console.log(msg.twist.twist.linear.x);
      })
    },
    // 电池信息：电流 电压 电量
    battery() {
      var rosTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: "diagnostics",
        messageType: "diagnostic_msgs/DiagnosticArray",
      });

      rosTopic.subscribe((msg) => {
        // console.log(msg.status[0]);
        var b = msg.status[0]
        if (b.message == 'battery_msg') {
          // console.log(b);
          if (b.values[0]) this.battery_msg.current = b.values[0].value;
          if (b.values[1]) this.battery_msg.voltage = b.values[1].value;
          if (b.values[2]) this.battery_msg.soc = b.values[2].value;
        }
      });
    },
    map_name() {
      var ls = localStorage.mapName || "map_ostream_display";
      this.map2 = this.map2 || ls
      localStorage.setItem('mapName', this.map2);
      // console.log(this.map2);

      this.$bus.$emit("mapName", ls);
      this.$store.commit("ros/GETMAPNAME", ls);

      this.mapDialogVisible = false;
    },
    allDevice() {
      this.robotDialogVisible = false;
      this.deviceDialogVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.left_info {
  display: flex;
  align-items: center;
}

.war_dialog {
  display: flex;
}

.jqr_id {
  display: inline-block;
  padding-right: 10px;
  cursor: pointer;
  font-weight: 600;
  // width: 80px;
}

@media screen and (max-width: 768px) {
  .tips {
    flex-wrap: wrap;
    // background-color: #f5f5f5;
  }
}

.demo-image__preview {
  display: flex;
  justify-content: center;

  .el-radio-group {
    display: flex;
    align-content: flex-start;
    flex-wrap: wrap;

    .map_list {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 5px;
    }

    .map_name {
      margin: 5px;

      .iname {
        margin-top: 5px;
      }
    }
  }
}

.signal-div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tips {
  // background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  cursor: pointer;
  flex-wrap: wrap;

  .left {
    // min-width: 500px;
    display: flex;
    align-items: center;

    .map {
      // margin: 0 0.5rem;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }

    .location {
      font-size: 20px;
      color: #fc7a01;
      margin: 0 5px;
    }
  }

  .right {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    flex-wrap: wrap;
  }
}

::v-deep .el-dialog__title {
  line-height: 32px;
  font-size: 24px;
  color: #303133;
  font-weight: 700;
}
</style>
