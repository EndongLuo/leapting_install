<template>
  <div class="signal-panel" :class="bgClass">
    <ul
      class="panel"
      :style="{ width: config.width + 'px', height: config.height + 'px' }"
    >
    <!-- 信号条 -->
      <li><span v-if="num >= -90"></span></li>
      <li><span v-if="num >= -80"></span></li>
      <li><span v-if="num >= -70"></span></li>
      <li><span v-if="num >= -60"></span></li>
      <li><span v-if="num >= -50"></span></li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "Signal",
  components: {},
  props: {
    // 传入百分比数值
    num: {
      type: Number,
      default: -50,
    },
    // 尺寸
    config: {
      type: Object,
      default: () => ({
        width: 30,
        height: 22,
      }),
    },
  },
  computed: {
    // 样式控制
    bgClass() {
      if (this.num == 0) return "no";
      else if (this.num >= -60) return "success" 
      else if (this.num >= -70) return "warning";
      else return "danger";
    },
  },
};
</script>
<style lang="less" scoped>
@color-success: #34a94d;
@color-warning: orange;
@color-danger: #fa3220;
@color-no: #f0f0f0;
.panel(@color) {
  .panel {
    li {
      span {
        background: @color;
      }
    }
  }
}

.signal-panel {
  margin-right: 10px;
  .panel {
    display: flex;
    justify-content: space-around;
    overflow: hidden;
    li {
      width: 15%;
      border-radius: 2px;
      background: rgba(190, 190, 190, 0.5);
      position: relative;
      span {
        position: absolute;
        top: 0;
        left: 0;
        display: inline-block;
        width: 100%;
        height: 100%;
        background: #34a94d;
      }
      &:nth-child(1) {
        height: 4px;
        margin-top: 14px;
      }
      &:nth-child(2) {
        height: 6px;
        margin-top: 12px;
      }
      &:nth-child(3) {
        height: 8px;
        margin-top: 10px;
      }
      &:nth-child(4) {
        height: 10px;
        margin-top: 8px;
      }
      &:nth-child(5) {
        height: 12px;
        margin-top: 6px;
      }
    }
  }
  &.success {
    .panel(@color-success);
  }

  &.warning {
    .panel(@color-warning);
  }

  &.danger {
    .panel(@color-danger);
  }
}
</style>
