<template>
  <div class="maps">
    <Tips />

    <!-- 数量 -->
    <div class="PVMdata">
      <div class="datain">
        <span style="font-size: 20px;">Installation Situation</span>
      </div>
      <div class="datain">
        <span>Installed：</span><i>2836</i>
      </div>
      <div class="datain">
        <span>Not Installed：</span><i>14235</i>
      </div>
      <div class="datain"><span>Install Today：</span><i>312</i></div>
    </div>

    <!-- 安装中 -->
    <!-- <div class="PVMdata1">
      <div class="datain">
        <span style="font-size: 20px;">Installing...</span>
      </div>
      <div class="datain">
        <span>Installed：</span><i>1</i>
      </div>
      <div class="datain">
        <span>Time：</span><i>{{time}}</i>
      </div>
    </div> -->

    <!-- 未安装 -->
    <!-- <div class="PVMdata2">
      <div class="datain" style="display: flex; justify-content: center; margin: 10px;">
        <span style="font-size: 20px;">Not Installed</span>
      </div>
      <div class="datain">
        <span>Location ID：</span><i>X0Y0_1_1</i>
      </div>
      <div class="datain">
        <span>Position：</span><i>102.76, 25.54</i>
      </div>
      <div class="datain" style="display: flex; justify-content: center;">
        <el-button>Single</el-button>
        <el-button>Multi</el-button>
        <el-button>Cancel</el-button>
      </div>
    </div> -->

    <!-- 多块安装 -->
    <!-- <div class="PVMdata2">
      <div class="datain" style="display: flex; justify-content: center; margin: 10px;">
        <span style="font-size: 20px;">Not Installed</span>
      </div>
      <div class="datain">
        <span>Start：</span><i>X0Y0_1_1</i>
      </div>
      <div class="datain">
        <span>End：</span><i style="color: chocolate;">Please Select</i>
        <span>End：</span><i>X0Y0_1_9</i>
      </div>
      <div class="datain">
        <span>QTY：</span><i>9</i>
      </div>
      <div class="datain" style="display: flex; justify-content: center;">
        <el-button>Confirm</el-button>
        <el-button>Cancel</el-button>
      </div>
    </div> -->

    <!-- 已安装 -->
    <!-- <div class="PVMdata2">
      <div class="datain" style="display: flex; justify-content: center; margin: 10px;">
        <span style="font-size: 20px;">Installed</span>
      </div>
      <div class="datain">
        <span>Location ID：</span><i>X0Y0_1_1</i>
      </div>
      <div class="datain">
        <span>Position：</span><i>102.76, 25.54</i>
      </div>
      <div class="datain">
        <span>PVM ID：</span><i>LRP904086221000422897</i>
      </div>
      <div class="datain">
        <span>Date：</span><i>2023-8-24 10:52:14</i>
      </div>
      <div class="datain" style="display: flex; justify-content: center;">
        <el-button>Navigation</el-button>
        <el-button>Install</el-button>
      </div>
    </div> -->

    <!-- 地图 -->
    <Map_canvas />
    <!-- <div style="display: none;">{{ notify }}}</div> -->
    <!-- 左侧 -->
    <!-- <div class="map_left">
      <div class="left_list">
        <div class="l_icon">
          <span title="暂停" @click="Pause" v-if="!flexbeSwitch"><i class="el-icon-video-pause" style="color: #F56C6C"></i></span>
          <span title="继续" @click="Pause" v-else><i class="el-icon-video-play" style="color: #67C23A"></i></span>
          <span title="紧急制动"><i class="el-icon-warning-outline" style="color: #ff0000"></i></span>
          
          <span title="建图"><i class="el-icon-circle-plus-outline"></i></span>
          <span title="操控" @click="carControl"><i class="el-icon-coordinate"></i></span>
          <span title="机械臂" @click="armControl"><img src="@/assets/img/mapicon/机械臂.png"></span>
          <span title="光伏尺寸" @click="PVSize"><i class="el-icon-edit-outline" ></i></span>
          <span title="修改图层" @click="trimLayer"><i class="el-icon-copy-document" ></i></span>
          <span title="添加站点" @click="setSite"><i class="el-icon-add-location"></i></span>
          <span title="视图" @click="viewLayers"><i class="el-icon-view"></i></span>
          

        </div>
      </div>
    </div> -->

    <!-- 展示光伏板尺寸 -->
    <!-- <el-dialog title="光伏板尺寸" :visible.sync="dialogFormVisible" width="80%">
      <el-form :model="pvSize">
        <el-form-item label="长度(毫米)" :label-width="formLabelWidth">
          <el-input v-model="pvSize.length" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="宽度(毫米)" :label-width="formLabelWidth">
          <el-input v-model="pvSize.width" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="upDataSize">修 改</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog> -->

    <!-- 上拉框 -->
    <div class="kuang" v-show="isShow">
      <Telecontrol />
    </div>
    <!-- 上拉框 -->
    <div class="kuang" v-show="isShowArm">
      <armcontrol />
    </div>

  </div>
</template>

<script>
import Telecontrol from "@/components/Telecontrol";
import armcontrol from "@/components/Telecontrol/joy111.vue";
import Map_canvas from "@/components/Map_canvas";
import { mapState } from 'vuex';
import Tips from "../tips";

function timingTime(){
      let start = '2023-08-28 20:36:00'
      let startTime = new Date(start).getTime()
      let currentTime = new Date().getTime()
      let difference = currentTime - startTime
      let m =  Math.floor(difference / (1000))
      let mm = m % 60  // 秒
      let f = Math.floor(m / 60)
      let ff = f % 60 // 分钟
      let s = Math.floor(f/ 60) // 小时

       s = s < 10 ? '0' + s : s
      ff = ff < 10 ? '0' + ff : ff;
      mm = mm < 10 ? '0' + mm : mm;
      return  s + ":" + ff + ":" + mm
    }
export default {
  components: { Map_canvas, Telecontrol, armcontrol,Tips },
  data() {
    return {
      flexbeSwitch:false,
      flag:false,
      isShow:false,
      isShowArm:false,
      isDraw: false,
      notifyPromise: Promise.resolve(),
      dialogFormVisible: false,
      pvSize: {
        length:0,
        width:0
      },
      formLabelWidth: '120px',
      time:null,
      num1:0
    };
  },
  mounted(){
    setInterval(()=>{
      this.time = timingTime()
    },100)
    setInterval(()=>{
      this.num1 +=1 
    },60000)
  },
  computed: {
    ...mapState('ros',['ros']),
    notify(){
      var data = this.$store.state.ros.diagnostics
      data.forEach(item => {
        if(item.level == 2){
          this.notifyPromise = this.notifyPromise.then(() => {
            return this.$notify.error({
              title: "错误",
              message: item.name + ' ' + item.message,
              offset: 100,
              duration: 2000
            });
          })
        }
      });
    },
  },
  methods:{
    // 暂停
    Pause(){
      var pause_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/flexbe/command/pause',
        messageType: 'std_msgs/Bool'
      });

      if (this.flexbeSwitch) this.flexbeSwitch = false;
      else this.flexbeSwitch = true;
      
      pause_sub.publish({"data":this.flexbeSwitch});
    },

    // 光伏尺寸数据回显
    PVSize(){
      var pvsize_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/robot_state',
        messageType: 'std_msgs/String'
      });

      pvsize_sub.subscribe((msg)=> {
        msg = JSON.parse(msg.data);
        this.pvSize.width = msg.parameter.pvm_width;
        this.pvSize.length = msg.parameter.pvm_length;
      })

      this.dialogFormVisible = true;
    },
    // 修改光伏尺寸
    upDataSize(){
      this.$confirm(`是否确认修改光伏尺寸`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            center: true,
            type: 'warning'
          }).then(() => {
            var updatasize_sub = new ROSLIB.Topic({
              ros: this.ros,
              name: '/robot_command',
              messageType: 'std_msgs/String'
            });
            const {width,length} = this.pvSize;
            updatasize_sub.publish({data:`{"parameter": {"pvm_length": ${Number(length)}, "pvm_width": ${Number(width)}}}`});

            this.$message.success('修改成功!');
            // console.log(this.pvSize);
            
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消修改'
            });
          });
    },
    setSize(){
      this.$message({
          showClose: true,
          duration:0,
          message: '识别失败！请把机器调整至平行光伏支架0.1米的位置。',
          type: 'error'
        });
    },
    // 修改图层
    trimLayer(){
      if(this.isDraw) this.isDraw = false;
      else this.isDraw = true;
      console.log(this.isDraw)
      this.$bus.$emit('drawLayer', this.isDraw)
    },

    // 添加站点
    addSite(value){
      var add_site = new ROSLIB.Topic({
        ros: this.ros,
        name: '/trig',
        messageType : 'std_msgs/Header'
      })

      add_site.publish({frame_id:`create_site:${value}`});
    },

    //设置站点
    setSite(){
      this.$prompt('请输入site name()', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[A-Za-z0-9_]+/,
          inputErrorMessage: 'name格式不正确'
        }).then(({ value }) => {
          this.addSite(value)
          this.$message({
            type: 'success',
            message: '你的site name是: ' + value
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });       
        });
    },

    // 显示图层
    viewLayers(){
      if(this.flag) this.flag = false;
      else this.flag = true;
      this.$bus.$emit('pathLayers', this.flag)
    },

    // 底盘车操控台
    carControl(){
      if (this.isShow) this.isShow = false;
      else {
        this.isShow = true;
        this.isShowArm = false;
      }
    },

    // 机械臂操控台
    armControl(){
      if (this.isShowArm) this.isShowArm = false;
      else {
        this.isShowArm = true;
        this.isShow = false;
      }
    }
  }
};
</script>

<style scoped lang="less">
.kuang{
  position: absolute;
  bottom: 0%;
  background: #000000bd;
  border-radius: 10px;
  box-shadow: 0px 0px 20px 10px rgb(36 36 36 / 50%), inset 0px 5px 20px 10px rgb(100 100 100 / 50%);
  width: 100%;
  // height: 40%;
  z-index: 1000;
}

.PVMdata{
  position: fixed;
  top: 110px;
  right: 10px;
  z-index: 1002;
  height: 120px;
  
  box-shadow: 5px 5px 20px 10px rgb(0 0 0 / 15%);

  .datain{
    margin: 5px 20px;
    display: flex;
    font-size: 16px;
    span{
      font-weight: 700;
    }
  }
}


.PVMdata1{
  position: fixed;
  // top: 110px;
  // right: 10px;
  z-index: 1002;
  // height: 120px;
  height: 100px;
  border-radius: 10px 0 0 10px;
  right: 0;
  bottom: 100px;
  

  box-shadow: 5px 5px 20px 10px rgb(0 0 0 / 15%);

  .datain{
    margin: 5px 20px;
    display: flex;
    font-size: 14px;
    span{
      font-weight: 700;
    }
  }
}

.PVMdata2{
  position: fixed;
  // top: 110px;
  // right: 10px;
  z-index: 1002;
  width: 300px;
  height: 190px;
  border-radius: 5px;
  right: 500px;
  bottom: 500px;
  background-color: #fff;
  

  box-shadow: 5px 5px 20px 10px rgb(0 0 0 / 15%);

  .datain{
    margin: 10px 40px;
    display: flex;
    font-size: 16px;
    span{
      font-weight: 700;
    }
  }
}

.maps {
  width: 100%;
  // height: 85vh;
  // margin-top: 5px;
  position: relative;
  // background: #fff;

  // border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  .map_left,
  .map_right {
    position: absolute;
    opacity: 0.8;
    top: 3%;
    width:40px;
    // border-radius: 0 10px 10px 0;
    border-radius: 10px;
    // padding: 0.1rem 0;
    left: 10px;
    font-size: 32px;
    z-index: 1000;
    .left_list {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 0 2px 2px 0px rgba(0, 0, 0, 0.1);
      .l_icon {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        img{
          max-width: 80%;
          height: auto;
          margin: 0 auto !important;
        }
        span {
          opacity: 0.7;
          // color: #007efc;
          // color: #ffffff;
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
  .map_right {
    right: 0;
    border-radius: 10px 0 0 10px;
  }
}
</style>
