<template>
  <div>
    <div class="tacks" @click="isTask" v-if="taskState.id">
      <span><b>{{ $t('task.task') }}：</b>{{ taskState.task_type == 0 ? `${$t('install.fai')}` : taskState.task_type == 1 ? `${$t('install.sai')}` : taskState.task_type == 2 ? `${$t('install.detach')}` : '' }}(<span style="font-weight: 700;"><span v-if="taskState.task_status == 3">{{ $t('task.completed') }}</span>
          <span v-if="taskState.task_status == 2">{{ $t('task.pause') }}</span>
          <span v-if="taskState.task_status == 1">{{ $t('task.executing') }}</span>
          <span v-if="taskState.task_status == 0">{{ $t('task.stop') }}</span></span>)</span>
      <span><b>{{ $t('task.progress') }}：</b>{{ (taskState.done_num / taskState.task_num).toFixed(4) * 100 || 0 }}%
        （{{ taskState.done_num }}/{{ taskState.task_num }}）</span>
      <!-- <span class="taskbox"><b>{{ $t('task.step') }}：</b>{{ taskState.task_step }}</span> -->
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex';
export default {
  name: "Tacks",
  computed: {
    ...mapState("socket", ['rosConnect', 'flexbeLog', 'taskState']),
  },
  methods: {
    isTask() {
      this.$emit("winChanged", true);
    }
  }
};
</script>

<style lang="less" scoped>
.tasklist {
  display: flex;
  justify-content: space-between;
  margin: 5px 50px
}

.li-in {
  display: inline-block;
  width: 150px;
  // margin-right: 50px;
}

.li-in1 {
  width: 320px;
}

.tacks {
  display: flex;
  font-size: 14px;
  margin: 5px 0;
  flex-wrap: wrap;
  cursor: pointer;

  span {
    padding: 0 7px;
    // width: 300px;
    // height: 22px;
    // overflow: hidden;
    // border-radius: 5px;
    // border: 1px solid #dbdbdb;
  }

}
</style>
