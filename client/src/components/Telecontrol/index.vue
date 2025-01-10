<template>
  <div>
    <div class="joy">
      <joy :velocity="velocity" :stop="stop" />
    </div>
  </div>
</template>

<script>
import joy from "@/components/Telecontrol/joy.vue";
export default {
  components: { joy },
  name: "CarControl",
  methods: {
    velocity(lin = 0, ang = 0) {
      // console.log("线速度：", lin,'---角速度：', ang);
      var axes = [0, lin, 0.5, ang, 0, 0, 0, 0];
      this.$store.dispatch("socket/control", { axes });
    },
    stop() {
      var axes = [0, 0, 1.0, 0, 0, 0, 0, 0];
      this.$store.dispatch("socket/control", { axes });
    },
  },
};
</script>

<style lang="less" scoped>
.joy {
  display: flex;
  align-items: center;
}

.page {
  margin-top: 30px;
  // display: flex;
}
</style>