<template>
  <div class="tips">
    <div class="left">
      <!-- 机器人id -->
      <div >

        <div class="jqr_id" v-if="!ros.isConnected" style="color: #f56c6c;">
          {{ $t('robot.notconnect') }} 
          <el-button  @click="reconnect()" type="info" size="small">
            {{ $t('robot.reconnect') }} 
          </el-button>
        </div>
        
        <div v-else class="left_info" @click="robotDialogVisible = true">
          <div class="jqr_id" >{{regexip(ros.socket.url)}}</div>

          <div class="jqr_id"  style="color: #34a94d;">{{ $t('robot.connected') }}</div>
          
          <!-- 电池 -->
          <Battery :quantity="Number(battery_msg.soc)" />

          <!-- 信号 -->
          <Signal :num="Number(wifi.signal)" />

          <div class="jqr_id">{{$t('robot.speed')}}：{{linear}} m/s</div>
          <div class="jqr_id">{{angular}} rad/s</div>
        </div>
      </div>

      <!-- 机器人弹框 -->
      <el-dialog
        :title="$t('robot.robotinfo')"
        :visible.sync="robotDialogVisible"
        width="80%"
        center
      >
        <!-- <span @click="allDevice">全部诊断>></span> -->
        <el-table stripe :data="robotData" border style="width: 100%">
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="id" :label="$t('robot.robotid')">
            <div class="jqr_id">{{regexip(ros.socket.url)}}</div>
          </el-table-column>
          <el-table-column prop="state" :label="$t('robot.connect')">
            <div class="jqr_id" v-if="ros.isConnected" style="color: #34a94d;">{{ $t('robot.connected') }}</div>
            <div class="jqr_id" v-else style="color: #f56c6c;">{{ $t('robot.notconnect') }}</div></el-table-column>
          <el-table-column
            prop="battery"
            :label="$t('robot.battery')"
            sortable
          >
          <div class="signal-div">
            <Battery :quantity="Number(battery_msg.soc)" rotate="-90" />
            <div>
                <i style="color: #64b4ff;">V </i>{{battery_msg.voltage}} V<br/>
                <i style="color:#64e1b4">A </i>{{ battery_msg.current }} A
              </div>
          </div>
        </el-table-column>
          <el-table-column prop="state" :label="$t('robot.network')">
            <div class="signal-div">
              <Signal :num="Number(wifi.signal)" />
              <div>
                <i class="el-icon-sort-up" style="color: #64b4ff;"></i>{{ wifi.upspeed }}MB/s<br/>
                <i class="el-icon-sort-down" style="color:#64e1b4"></i>{{ wifi.downspeed }}MB/s
              </div>
            </div>
            
            
          </el-table-column>
          <!-- <el-table-column prop="location" label="定位"></el-table-column> -->
        </el-table>
        <!-- <div class="war_dialog">ID: 机器人001，电量：<Battery :quantity="10" />，连接状态：已连接</div>
        <div class="war_dialog">ID: 机器人005，电量：<Battery :quantity="60" />，连接状态：未连接</div> -->
        <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="robotDialogVisible = false">{{$t('mains.cancel')}}</el-button>
          <el-button type="primary" @click="robotDialogVisible = false">
            {{$t('mains.confirm')}}
          </el-button>
        </span>
      </el-dialog>

      <!-- 地图弹框 -->
      <el-dialog
        :title="$t('map.selectmap')"
        :visible.sync="mapDialogVisible"
        width="80%"
        center
      >
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
          <el-button @click="mapDialogVisible = false">{{$t('mains.cancel')}}</el-button>
          <el-button type="primary" @click="map_name()">{{$t('mains.confirm')}}</el-button>
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
      uname:{
        robotinfo:this.$t('robot.robotinfo'),
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
      battery_msg:{
        current:'0',
        voltage:'0',
        soc:'60'
      },
      angular:'0',
      linear:'0',
    };
  },
  computed:{
    ...mapState("ros", [
      'ros',
      "diagnostics",
      "Device",
      'wifi'
    ]),
    // ...mapGetters("ros", ['wifi']),
  },
  mounted() {
    this.map_name(); 
    this.battery();
    this.speed()
  },
  methods: {

    reconnect(){
      this.$message(`${this.$t('connPrompt.reconn')}...`);
      this.$bus.$emit('reconn')
    },
    regexip(ws){
      const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
      return ws.match(regex)[1];
    },

    // 速度
    speed(){
      var rosTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: "odom",
        messageType: "nav_msgs/Odometry",
      });

      rosTopic.subscribe((msg) => {
        this.angular = (msg.twist.twist.angular.z).toFixed(2);
        this.linear = (msg.twist.twist.linear.x).toFixed(2);
        // console.log(msg.twist.twist.angular.z);
        // console.log(msg.twist.twist.linear.x);
      })
    },
    // 电池信息：电流 电压 电量
    battery(){
      var rosTopic = new ROSLIB.Topic({
        ros: this.ros,
        name: "diagnostics",
        messageType: "diagnostic_msgs/DiagnosticArray",
      });

      rosTopic.subscribe((msg) => {
        // console.log(msg.status[0]);
        var b = msg.status[0]
        if(b.message == 'battery_msg'){
          // console.log(b);
          if(b.values[0]) this.battery_msg.current = b.values[0].value;
          if(b.values[1]) this.battery_msg.voltage = b.values[1].value;
          if(b.values[2]) this.battery_msg.soc = b.values[2].value;
        }
      });
    },
    map_name() {
      var ls = localStorage.mapName || "map_ostream_display";
      this.map2 = this.map2 || ls
      localStorage.setItem('mapName',this.map2);
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
      .iname{
        margin-top: 5px;
      }
    }
  }
}
.signal-div{
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
</style>
