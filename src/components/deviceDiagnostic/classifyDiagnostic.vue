<template>
  <div>
    <span v-show="false">{{ getTabPane }}</span>
    <!-- <el-tooltip :content="'agg: ' + agg" placement="top">
      <el-switch
        v-model="agg"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-value="jsonAgg"
        inactive-value="classifyDiagnostics">
      </el-switch>
    </el-tooltip> -->
    <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="t in elTabPane" :key="t.id">
        <span slot="label">
          <i :class="'el-icon-' + t.icon"></i>
          {{ t.name }}
          <el-badge :value="t.num" class="item" :type="t.type"></el-badge>
        </span>

        <!-- 表格开始 -->
        <el-table
          :data="classifyDiagnostics"
          style="width: 100%; margin-bottom: 20px"
          row-key="name"
          :height="tableHeight"
          size="small"
          :stripe="true"
          default-expand-all
          :tree-props="{ children: 'underling', hasChildren: 'hasChildren' }"
        >
          <el-table-column type="index" :index="index"> </el-table-column>
          <el-table-column prop="name" label="Name">
            <template slot-scope="scope">
              <i
                class="el-icon-success success"
                v-if="scope.row.level == 0"
              ></i>
              <i
                class="el-icon-warning warning"
                v-else-if="scope.row.level == 1"
              ></i>
              <i
                class="el-icon-error error"
                v-else-if="scope.row.level == 2"
              ></i>
              <i class="el-icon-question question" v-else></i>
              <span style="margin-left: 10px">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="Status" width="200">
          </el-table-column>
          <el-table-column prop="level" sortable label="Level" width="120">
          </el-table-column>
        </el-table>
        <!-- 表格结束 -->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
export default {
  data() {
    return {
      activeName: "0",
      deviceDiagnostic: [],
      index: 1,
      agg:'jsonAgg',
      tableHeight: window.innerHeight - 180,
      // diag: `{"ALGORITHM": {"hardware_id": "", "level": 3, "message": "Stale", "name": "ALGORITHM", "underling": {"LOCALIZATION": {"hardware_id": "", "level": 3, "message": "Stale", "name": "LOCALIZATION"}}}, "DEVICES": {"hardware_id": "", "level": 3, "message": "Stale", "name": "DEVICES", "underling": {"DRIVE": {"hardware_id": "", "level": 3, "message": "Stale", "name": "DRIVE"}, "IMU": {"hardware_id": "", "level": 3, "message": "Stale", "name": "IMU"}, "LASER": {"hardware_id": "", "level": 3, "message": "Stale", "name": "LASER"}, "PLC": {"hardware_id": "", "level": 3, "message": "Stale", "name": "PLC"}}}, "STATUS": {"hardware_id": "", "level": 2, "message": "Error", "name": "STATUS", "underling": {"ACTION": {"hardware_id": "", "level": 0, "message": "OK", "name": "ACTION"}, "ESTOP": {"hardware_id": "", "level": 3, "message": "Stale", "name": "ESTOP", "underling": {"BASE": {"hardware_id": "", "level": 3, "message": "Stale", "name": "BASE"}}}, "MAINTENANCE": {"hardware_id": "", "level": 0, "message": "OK", "name": "MAINTENANCE"}, "MOTION": {"hardware_id": "", "level": 3, "message": "Stale", "name": "MOTION", "underling": {"BACK": {"hardware_id": "", "level": 3, "message": "Stale", "name": "BACK"}, "LEFT": {"hardware_id": "", "level": 3, "message": "Stale", "name": "LEFT"}, "RIGHT": {"hardware_id": "", "level": 3, "message": "Stale", "name": "RIGHT"}}}, "START": {"hardware_id": "", "level": 3, "message": "Stale", "name": "START", "underling": {"RELAY": {"hardware_id": "", "level": 3, "message": "Stale", "name": "RELAY"}}}, "TASK": {"hardware_id": "", "level": 0, "message": "OK", "name": "TASK", "underling": {"BEHAVIOR": {"hardware_id": "", "level": 0, "message": "OK", "name": "BEHAVIOR", "underling": {"task behavior": {"hardware_id": "", "level": 0, "message": ":", "name": "task behavior"}}}, "STATE": {"hardware_id": "", "level": 0, "message": "OK", "name": "STATE", "underling": {"task state": {"hardware_id": "", "level": 0, "message": ":", "name": "task state"}}}}}}}, "SYSTEM": {"hardware_id": "", "level": 0, "message": "OK", "name": "SYSTEM", "underling": {"NET": {"hardware_id": "", "level": 0, "message": "OK", "name": "NET", "underling": {"wifi": {"hardware_id": "", "level": 0, "message": "ssid:Leapting_Guest, signal(dbm):-48, upspeed(Mb/s):0, downspeed(Mb/s):0", "name": "wifi"}}}}}}`,      
    };
  },
  computed: {
    ...mapState("ros", [
      "diagnostics",
      "elTabPane",
      "Device",
      "classifyDiagnostics",
    ]),
    ...mapGetters("ros", ["getTabPane", "getClassify"]),
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 180;
    };
    this.handleClick();
    // this.getDiag();
  },
  methods: {
    handleClick() {
      this.getClassify(this.activeName);
    },
    // digui(Obj, newArray = []) {
    //   for (const key in Obj) {
    //     if (Object.hasOwnProperty.call(Obj, key)) {
    //       const value = Obj[key];
    //       newArray.push(value);
    //       if (typeof value === "object" && value.underling) {
    //         const underling = this.digui(value.underling);
    //         value.underling = underling;
    //       }
    //     }
    //   }
    //   return newArray;
    // },
    // getDiag() {
    //   console.log(this.Device);
    //   var diag = JSON.parse(this.diag);
    //   console.log(diag);
    //   var str = diag.SYSTEM.underling.NET.underling.wifi.message;
    //   console.log(str);
    //   let obj = {};

    //   // 使用正则表达式将字符串按逗号和空格分割成多个键值对
    //   str.split(/,\s+/).forEach(pair => {
    //   // 使用正则表达式将键和值分离
    //   let [key, value] = pair.split(/:\s*/);
    //   // 将键值对添加到对象中
    //   obj[key] = value;
    //   });
    //   console.log(obj)

    //   var diag1 = this.digui(diag);
    //   console.log("diag1", diag1);
    // },
  },
};
</script>

<style scoped>
.el-table .cell {
  line-height: 0px;
}
.success {
  color: #67c23a;
}
.warning {
  color: #e6a23c;
}
.error {
  color: #f56c6c;
}
.question {
  color: #409eff;
}
</style>
