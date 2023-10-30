<template>
  <div style="background-color: #ffffff0a; overflow: hidden; width: 70%;min-width: 580px;min-height: 90vh; margin: 0 auto;">
    <!-- <el-button type="primary" v-if="!isEdit" @click="isEdit = true">{{ $t('mains.edit') }}</el-button>
    <el-button v-else @click="isEdit = false">{{ $t('mains.goback') }}</el-button> -->

      <!-- 电量，避障，组件尺寸 -->
      <div class="pduControl">
      <h1 class="title">{{$t('config.basecontrol')}}</h1>
      <div class="outbox">
        <div class="inbox"><span>{{$t('config.avoidance')}}：</span> <el-switch v-model="autocross" @input="upDataAvoidance"></el-switch></div>
        <div class="inbox"><span>{{$t('config.reminder')}}：</span><div style="width: 100px;"><el-slider v-model="value2" :step="5"></el-slider></div></div>
        <div class="inbox"><span style="width: 386px;">{{$t('config.pvmsize')}}(mm)：</span>
          <el-input v-model="pvm_length" @blur="upDataPVM"></el-input>
          <el-input v-model="pvm_width" @blur="upDataPVM"></el-input>
        </div>
        <div class="inbox"><span style="width: 232px;">{{$t('config.installgap')}}(mm)：</span>
          <el-input v-model="install_gap" @blur="upDataPVM" style="width: 100%;"></el-input>
        </div>
      </div>
    </div>

    <!-- pdu控制 -->
    <div class="pduControl">
      <h1 class="title">{{$t('config.pducontrol')}}</h1>
      <div class="outbox">
        <div class="inbox"><span>{{$t('config.autoon')}}：</span> <el-switch v-model="autoSwitch" @input="pduAuto" active-value="1"
            inactive-value="0"></el-switch></div>
        <div class="inbox"><span>{{$t('config.chassis')}}：</span> <el-switch v-model="chassisSwitch" @input="chassis" active-value="1"
            inactive-value="0"></el-switch></div>
        <div class="inbox"><span>{{$t('config.inverter')}}：</span> <el-switch v-model="inverterSwitch" @input="inverter"  active-value="1"
            inactive-value="0"></el-switch></div>
        <div class="inbox"><span>{{$t('config.charge')}}：</span> <el-switch v-model="chargeSwitch" @input="openCharge" active-value="1"
            inactive-value="0"></el-switch></div>
      </div>
    </div>


    <!-- 设备状态 -->
    <div class="pduControl" v-if="pduStatus != null">
      <h1 class="title">{{$t('config.devicestatus')}}</h1>
      <div class="outbox1">
        <div v-for="i in pduStatus" :key="i.key" style="margin: 5px;">
        {{ i.key }}: <span style="font-weight: 300;">{{ i.value }}</span>
      </div>
      </div>
    </div>

    <!-- <el-form ref="form" size="small" :model="form">
      <el-form-item v-for="(ros, k1, index) in rosCfg" :key="index">
        <el-divider content-position="center">{{ k1 }}</el-divider>

        <el-form-item v-for="(r, k2, index) in ros" :key="index" :label="k2" label-width="140px">
          <div v-if="!isEdit">
            ：{{ form[k1][k2] }}
          </div>

          <div v-else>
            <div v-if="typeof r == 'boolean'">
              <el-switch v-model="form[k1][k2]"></el-switch>
            </div>
            <div v-else-if="typeof r == 'string'">
              <el-col :span="18">
                <el-input v-model="form[k1][k2]"></el-input></el-col>
            </div>
            <div v-else-if="typeof r == 'object'">
              <el-col :span="18">
                <el-select style="width:100%" v-model="form[k1][k2]" placeholder="请选择">
                  <el-option v-for="s, i in r" :key="i" :label="s.label" :value="s"></el-option>
                </el-select></el-col>
            </div>
            <div v-else-if="typeof r == 'number'">
              <el-col :span="18">
                <el-input type="number" :step="0.1" v-model.number="form[k1][k2]"></el-input></el-col>
            </div>
          </div>
        </el-form-item>
      </el-form-item>
      <el-form-item class="threeBtn" v-if="isEdit">
        <el-button type="primary" @click="saveCfg">{{ $t('mains.save') }}</el-button>
      </el-form-item>
    </el-form> -->
  </div>
</template>

<script>
import { reqRoscfg } from "@/api";
import rosCfg from "@/assets/ros.cfg.json";
import ROSLIB from "roslib/src/RosLib";
import { mapState } from "vuex";
export default {
  data() {
    return {
      isEdit: false,
      rosCfg: null,
      form: null,
      chargeSwitch: false, // 充电开关
      inverterSwitch: 0, // 逆变器开关
      chassisSwitch: false, // 底盘开关
      autoSwitch: false, // pdu自动
      pdu_sub: null,
      updatasize_sub:null,
      value2:20,
      pvm_length:'2123',
      pvm_width:'1123',
      autocross:false,
      install_gap:10
    };
  },
  computed: {
    ...mapState("ros", ["ros", "pduStatus"]),
  },
  mounted() {
    // this.getRoscfg();
    // this.getRoscfgs();
    this.avoidanceEcho();

    this.pdu_sub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/pdu_request',
      messageType: 'std_msgs/String'
    });

    this.updatasize_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/robot_command',
        messageType: 'std_msgs/String'
      });

    // setInterval(()=>{
    //   console.log(this.pduStatus);
    //   this.pduStatus.filter(o => {
    //     if (o.key == 'chassis status') this.chassisSwitch = o.value;
    //     else if (o.key == 'inverter status') this.inverterSwitch = o.value;
    //     else if (o.key == 'charger status') this.chargeSwitch = o.value;
    //   })
    // },3000)
  },
  watch: {
    pduStatus(val) {
      // console.log(val);
      val.filter(o => {
        // if(o.value=='0'||o.value=='1') o.value = Number(o.value)
        // console.log(o.value);
        if (o.key == 'chassis status') this.chassisSwitch = o.value;
        else if (o.key == 'inverter status') this.inverterSwitch = o.value;
        else if (o.key == 'charger status') this.chargeSwitch = o.value;
      })
    }
  },
  methods: {
    // 逆变器开关
    inverter() {
      if(!this.pdu_sub) return;
      if (this.inverterSwitch =='1') this.pdu_sub.publish({ data: "inverter_on" });
      else this.pdu_sub.publish({ data: "inverter_off" });
    },

    // 充电开关
    openCharge() {
      if(!this.pdu_sub) return;
      console.log(this.chargeSwitch);
      if (this.chargeSwitch =='1') this.pdu_sub.publish({ data: "charge_on" }); 
      else this.pdu_sub.publish({ data: "charge_off" });
    },

    // 底盘开关
    chassis() {
      if(!this.pdu_sub) return;
      if (this.chassisSwitch =='1') this.pdu_sub.publish({ data: "chassis_on" });
      else this.pdu_sub.publish({ data: "chassis_off" });
    },

    // 自动开关
    pduAuto() {
      if(!this.pdu_sub) return;
      if (this.autoSwitch =='1') this.pdu_sub.publish({ data: "auto_on" });
      else this.pdu_sub.publish({ data: "auto_off" });
    },

    saveCfg() {
      var cfg_pub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/cfg_istring',
        messageType: "std_msgs/String",
      });

      var msgJson = JSON.stringify(this.form);
      // console.log(msgJson)
      cfg_pub.publish({ data: msgJson });
      // console.log('pub', this.form);

      this.isEdit = false;
      this.getRoscfgs();

      var msgJson = JSON.stringify(this.form);
      // console.log(this.form)
      localStorage.setItem('pvm_param', msgJson);

      this.$message({
        type: 'success',
        message: 'Save Success!'
      });
      this.isEdit = false;
    },

    getRoscfgs() {
      var cfg_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/cfg_ostring',
        messageType: "std_msgs/String",
      });
      // console.log(cfg_sub);

      cfg_sub.subscribe((msg) => {
        this.rosCfg = rosCfg;
        var msgJson = `[${msg.data}]`;
        // console.log(msg.data)
        this.form = JSON.parse(msgJson)[0];
        // console.log('sub', this.form);
      })
    },
    async getRoscfg() {
      var res = await reqRoscfg();
      this.rosCfg = rosCfg;
      var ls = localStorage.getItem('pvm_param');
      if (ls) this.form = JSON.parse(ls);
      else {
        this.form = res.data.data;
        localStorage.setItem('pvm_param', JSON.stringify(res.data.data))
      }
    },

    // robot_state数据回显
    avoidanceEcho(){
      var pvsize_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/robot_state',
        messageType: 'std_msgs/String'
      });

      pvsize_sub.subscribe((msg)=> {
        msg = JSON.parse(msg.data);
        console.log(msg);
        // this.autocross = msg.dynparam.cmd_vel_filter.filter_enabled;
        this.pvm_length = msg.parameter.pvm_length;
        this.pvm_width = msg.parameter.pvm_width;
        this.install_gap = msg.parameter.install_gap;

        var pvm_param = {pvm_width:this.pvm_width,install_gap:this.install_gap};
        localStorage.setItem('pvm_param',JSON.stringify(pvm_param));
      })
    },
    // 修改避障状态
    upDataAvoidance(){
      const {pvm_length,pvm_width,install_gap} =this;
      if (!this.autocross) {
        console.log(this.autocross);
        this.$confirm(`是否确认关闭避障`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            center: true,
            type: 'warning'
          }).then(() => {
            this.updatasize_pub();

            this.$message.success('避障已关闭!');
          }).catch(() => {
            this.autocross = true
            this.$message({
              type: 'info',
              message: '取消关闭'
            });
          });
      }else{
        if(!this.updatasize_sub) return
        this.updatasize_pub();
      } 
    },

    // 修改PVM尺寸
    upDataPVM(){
      const {pvm_length,pvm_width,install_gap} =this;
      this.updatasize_pub();
      var pvm_param = {pvm_width,install_gap};
      localStorage.setItem('pvm_param',JSON.stringify(pvm_param));
    },

    updatasize_pub(){
      const {pvm_length,pvm_width,install_gap,autocross} =this;
      this.updatasize_sub.publish({data:`{"parameter": {"pvm_length":  ${pvm_length},"pvm_width":  ${pvm_width},"install_gap":  ${install_gap}},"dynparam": {"cmd_vel_filter": {"filter_enabled": ${autocross}}}}`});
    }
  },
};
</script>

<style lang="less" scoped>
.pduControl {
  width: 500px;
  margin: 15px auto;
  padding: 30px 40px;
  border-radius: 5px;
  background: #cccccc10;
  // box-shadow: 5px 5px 20px #64646499;
  box-shadow: 0px 0px 10px #7f7f7f69;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  font-weight: 700;

  .title {
    margin: 15px;
    font-size: 20px;
    font-weight: 700;
  }
  .outbox1{
    font-size: 16px;
  }

  .outbox {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .inbox {
      display: flex;
      align-items: center;
      margin: 10px 20px;
      // font-size: 16px;
      // font-weight: 700;
      // span{
        // width: 80px;
      // }
    }
  }

}

.el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 2px;
}

::v-deep .threeBtn .el-form-item__content {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  margin-left: 0 !important;
}</style>