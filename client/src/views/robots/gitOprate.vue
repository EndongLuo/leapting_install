<template>
  <div>
    <div class="git_option">
      <el-form>
        <el-form-item label="branch: ">
          <el-input placeholder="branch name" v-model="gitMsg.name" clearable></el-input>
          <!-- <el-select v-model="gitMsg.name" placeholder="请选择option">
          <el-option label="main" value="main"></el-option>
        </el-select> -->
        </el-form-item>
        <el-form-item label="option: ">
          <el-select v-model="gitMsg.op" placeholder="请选择option">
            <el-option label="query" value="query"></el-option>
            <el-option label="select" value="select"></el-option>
            <el-option label="add" value="add"></el-option>
            <el-option label="update" value="update"></el-option>
            <el-option label="remove" value="remove"></el-option>
          </el-select>
        </el-form-item></el-form>
      <el-button type="primary" @click="git_send">send</el-button>
    </div>
    <L_table :tableData="tableData" :column="column" />
  </div>
</template>

<script>
import L_table from "@/components/L_table";
import { mapState } from 'vuex';

export default {
  components: { L_table, },
  data() {
    return {
      tableData: [],
      column: [
        {
          id: '003',
          prop: 'git_option',
          label: 'option'
        },
        {
          id: '001',
          prop: 'uid',
          label: 'uid'
        }, {
          id: '002',
          prop: 'git_name',
          label: 'branch'
        },
      ],
      git_option: '',
      git_pub: null,
      gitMsg: {
        op: 'query',
        name: 'add3',
      }
    };
  },
  computed: {
    ...mapState('ros', ['ros'])
  },
  mounted() {
    // 订阅该主题
    this.git_pub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/trig',
      messageType: 'std_msgs/Header',
    });

    this.git_send();
  },
  methods: {
    gitMsgs() {
      return new ROSLIB.Message({ seq: 202, frame_id: `{"type": "git", "op": "${this.gitMsg.op}", "name": "${this.gitMsg.name}"}` });
      // return new ROSLIB.Message({ seq: 202, frame_id:`{"type": "launch", "switch": "0/1", "name": "pud"}`});
    },
    // git_send
    git_send() {
      this.git_pub.publish(this.gitMsgs());
    },


  },
};
</script>

<style scoped>
.git_option,
.el-form,
.el-form-item {
  display: flex;
  /* justify-content: center; */
  align-items: center;
  margin-bottom: 10px;
}

.el-form-item {
  margin-bottom: 0px !important;
  margin-right: 20px;

}

.el-from {
  display: flex;
}

.el-select {
  margin-right: 10px;
}
</style>
