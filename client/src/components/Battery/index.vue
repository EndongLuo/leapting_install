<template>
  <div class="electric-panel" :class="bgClass">
    <div class="panel" :style="{ transform: `rotate(${Number(rotate)}deg)` }">
      <div class="remainder" :style="{ width: quantity + '%' }" />
    </div>
    <div
      v-show="showText"
      :style="{ marginLeft: (parseFloat(rotate) ? 0 : '5') + 'px' }"
      class="text"
    >
      {{ quantity }}%
    </div>
  </div>
</template>

<script>
/**
 * 电池电量Icon
 */
export default {
  name:'Battery',
  props: {
    // 电量值
    quantity: {
      type: Number,
      default: 0,
    },
    // 是否显示电量值
    showText: {
      type: Boolean,
      default: true,
    },
    // 旋转角度
    rotate: {
      type: String,
      default: "0",
    },
  },
  computed: {
    bgClass() {
      if (this.quantity>100) return "success";
      else if (this.quantity >= 30) return "success";
      else if (this.quantity >= 15) return "warning";
      else return "danger";
    },
  },
};
</script>

<style lang="less" scoped>
@color-success: #34a94d;
@color-warning: orange;
@color-danger: #fa3220;
.panel(@color) {
  .panel {
    border-color: @color;
    
    &:before {
      background: @color;
    }
    .remainder {
      background: @color;
    }
  }
  .text {
    color: @color;
    overflow: hidden;
  }
}
.electric-panel {
  display: flex;
  // justify-content: center;
  align-items: center;
  margin-right: 10px;

  .panel {
    box-sizing: border-box;
    width: 20px;
    height: 14px;
    // position: relative;
    border: 2px solid #ccc;
    padding: 1px;
    border-radius: 3px;

    &::before {
      content: "";
      border-radius: 0 1px 1px 0;
      height: 6px;
      background: #ccc;
      width: 4px;
      position: absolute;
      top: 50%;
      right: -4px;
      transform: translateY(-50%);
    }
    .remainder {
      border-radius: 1px;
      position: relative;
      height: 100%;
      width: 0%;
      left: 0;
      top: 0;
      background: #fff;
    }
  }

  .text {
    text-align: left;
    // color: #000 !important;
    width: 35px;
    font-size: 12px;
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
