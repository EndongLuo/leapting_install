<template>
  <div class="tips">
    <div class="left">
      <!-- 机器人id -->
      <div>
        <div class="jqr_id" v-if="!rosConnect" style="color: #f56c6c;"> {{ $t('robot.notconnect') }} </div>

        <div v-else class="left_info" @click="robotDialogVisible = true">
          <div class="jqr_id" style="color: #34a94d;">{{ $t('robot.connected') }}</div>

          <!-- 电池 -->
          <Battery :quantity="battery" />

          <!-- 信号 -->
          <!-- <Signal :num="Number(wifi.signal)" /> -->

          <!-- 诊断 -->
          <div style="margin-right: 10px">
            <i class="el-icon-question" v-if="newDiagnostics.status == 3" style="color: #f56c6c"></i>
            <i class="el-icon-error" v-else-if="newDiagnostics.status == 2" style="color: #f56c6c"></i>
            <i class="el-icon-warning" v-else-if="newDiagnostics.status == 1" style="color: #e6a23c"></i>
            <i class="el-icon-success" v-else style="color: #67c23a"></i>
          </div>
          <div class="jqr_id">{{ $t('robot.speed') }}：{{ speed.linear }} m/s</div>
          <div class="jqr_id">{{ speed.angular }} rad/s</div>
        </div>
      </div>

      <!-- 机器人弹框 -->
      <el-dialog :title="$t('nav.diagnostic')" :visible.sync="robotDialogVisible" width="80%" center
        :close-on-click-modal="true">
        <!-- <el-table stripe :data="robotData" border style="width: 100%">
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
        </el-table> -->
        <!-- {{ diagnosticlist }} -->
        <div style="display: flex; flex-wrap: wrap;justify-content: space-between">
          <div v-for="d of newDiagnostics.list" :key="d.name"
            style="border: #ebeef5 1px solid; margin: -1px 0 0 -1px;padding: 20px 10px; width: 25%;font-size: 16px; display: flex">
            <span v-if="d.message == 3"><i class="el-icon-question"
                style="color: #f56c6c; margin-right: 10px"></i></span>
            <span v-else-if="d.message == 2"><i class="el-icon-error"
                style="color: #f56c6c; margin-right: 10px"></i></span>
            <span v-else-if="d.message == 1"><i class="el-icon-warning"
                style="color: #e6a23c; margin-right: 10px"></i></span>
            <span v-else><i class="el-icon-success" style="color: #67c23a; margin-right: 10px"></i></span>
            <!-- {{ d.key }} -->
            {{ d.name }}
          </div>

          <el-divider>More</el-divider>

          <!-- <div style=" width: 100%; height: 60px; line-height: 60px; font-weight: 700; font-size: 24px;">实时数据：</div> -->
          <div v-for="(d, index) of newDiagnostics.list2" :key="index"
            style="border: #ebeef5 1px solid; margin: -1px 0 0 -1px; padding: 20px 10px; width: 25%; display: flex ;font-size: 16px;">
            <span>{{ d.name }}：</span><span style="font-weight: 700;">{{ d.message }}</span>
            <br />
          </div>
        </div>
      </el-dialog>

    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Battery from "@/components/Battery";
import Signal from "@/components/Signal";

export default {
  name: "home",
  components: { Signal, Battery },
  data() {
    return {
      robotDialogVisible: false,
    };
  },
  computed: {
    ...mapState('socket', ['rosConnect', 'newDiagnostics', 'speed', 'battery']),
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
    display: flex;
    align-items: center;

    .map {
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
