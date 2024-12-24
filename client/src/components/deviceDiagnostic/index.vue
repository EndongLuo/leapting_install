<template>
  <div>
    <el-table
      :data="treeDiagnostics"
      style="width: 100%; margin-bottom: 20px"
      row-key="name"
      height="550"
      size="small"
      :stripe="true"
      :tree-props="{ children: 'underling', hasChildren: 'hasChildren' }"
    >
    <el-table-column
          type="index"
          :index="index">
        </el-table-column>
      <el-table-column prop="name" label="Name">
        <template slot-scope="scope">
          <i class="el-icon-success success" v-if="scope.row.level == 0"></i>
          <i class="el-icon-warning warning" v-else-if="scope.row.level == 1"></i>
          <i class="el-icon-error error" v-else-if="scope.row.level == 2"></i>
          <i class="el-icon-question question" v-else></i>
          <span style="margin-left: 10px">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="Status" width="200">
      </el-table-column>
      <el-table-column prop="level" sortable label="Level" width="120">
      </el-table-column>
    </el-table>
  </div>
</template>
  
<script>
import { mapGetters, mapState } from 'vuex';
export default {
  props:['level'],
  data() {
    return {
      deviceDiagnostics: [],
      index: 1,
      Device: [
        {
          message: "Stale",
          name: "/robot_2/ALGORITHM",
          level: 3,
        },
        {
          message: "ok",
          name: "/robot_2/STATUS/MAINTENANCE",
          level: 0,
        },
        {
          message: "Stale",
          name: "/robot_2/STATUS/MOTTON/LEFT",
          level: 3,
        },
        {
          message: "Stale",
          name: "/robot_2/STATUS/MOTTON/RIGHT",
          level: 3,
        },
        {
          message: "Stale",
          name: "/robot_2/STATUS/MOTTON/NACK",
          level: 3,
        },
        {
          message: "Warning",
          name: "/robot_2/STATUS/MOTTON",
          level: 1,
        },
        {
          message: "Stale",
          name: "/robot_2/STATUS/START/RELAY",
          level: 3,
        },
        {
          message: "Stale",
          name: "/robot_2/STATUS/START",
          level: 3,
        },
        {
          message: "ok",
          name: "/robot_2/STATUS/TASK",
          level: 0,
        },
        {
          message: "ok",
          name: "/robot_2/STATUS",
          level: 2,
        },
        {
          message: "ok",
          name: "/robot_2",
          level: 2,
        },
        {
          message: "Stale",
          name: "/robot_1/STATUS/START",
          level: 3,
        },
        {
          message: "ok",
          name: "/robot_1/STATUS/TASK",
          level: 0,
        },
        {
          message: "ok",
          name: "/robot_1/STATUS",
          level: 2,
        },
        {
          message: "ok",
          name: "/robot_1",
          level: 2,
        },
      ],
    };
  },
  methods: {
  },
  computed:{
    // ...mapState('ros',['diagnostics']),
    ...mapGetters('ros',['treeDiagnostics'])
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