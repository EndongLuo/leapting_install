<template>
  <div>
    <div class="joy" >
      <joy :velocity="velocity" :stop="stop" />
    </div>
  </div>
</template>
  
<script>
import joy from "@/components/Telecontrol/joy.vue";
import { mapState } from "vuex";
export default {
  components: { joy },
  name: "CarControl",
  data() {
    return {
      publisher: null,
      message: {
        header: {
          frame_id: '/web'
        },
        axes: [0, 0, 1.0, 0, 0, 0, 0, 0],
        buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      timer: null,
    };
  },
  mounted() {
    this.setupRos();
  },
  computed: {
    ...mapState("ros", ["ros"]),
  },
  methods: {
    setupRos() {
      this.publisher = new ROSLIB.Topic({
        ros: this.ros,
        name: "joy",
        messageType: "sensor_msgs/Joy",
      });
    },
    velocity(lin = 0, ang = 0){
      console.log("线速度：", lin,'---角速度：', ang);
      this.message.axes = [0, lin, 0.5, ang, 0, 0, 0, 0];
      this.publisher.publish(this.message);
    },
    stop() {
      // console.log("停止");
      if(!this.publisher) return;
      this.message.axes = [0, 0, 1.0, 0, 0, 0, 0, 0];
      this.publisher.publish(this.message);
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
  