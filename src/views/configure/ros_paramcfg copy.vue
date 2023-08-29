<template>
  <div>
    <el-button type="primary" v-if="!isEdit" @click="isEdit = true">编辑</el-button>
    <el-button v-else  @click="isEdit = false">返回</el-button>
    <el-form ref="form" size="small" :model="form">
      <el-form-item v-for="(ros, k1, index) in rosCfg" :key="index">
        <el-divider content-position="center">{{ k1 }}</el-divider>

        <el-form-item
          v-for="(r, k2, index) in ros"
          :key="index"
          :label="k2"
          label-width="140px"
        >
        <div v-if="!isEdit">
          ：{{ form[k1][k2] }}
        </div>

        <div v-else>
          <div v-if=" typeof r =='boolean'">
            <el-switch v-model="form[k1][k2]"></el-switch>
          </div>
          <div v-else-if=" typeof r =='string'">
            <el-col :span="18">
            <el-input v-model="form[k1][k2]"></el-input></el-col>
          </div>
          <div v-else-if=" typeof r =='object'">
            <el-col :span="18">
            <el-select style="width:100%" v-model="form[k1][k2]" placeholder="请选择">
              <el-option  v-for="s,i in r" :key="i" :label="s.label" :value="s"></el-option>
            </el-select></el-col>
          </div>
          <div v-else-if=" typeof r =='number'">
            <el-col :span="18">
            <el-input type="number" :step="0.1" v-model.number="form[k1][k2]"></el-input></el-col>
          </div>
        </div>
        </el-form-item>
      </el-form-item>
      <el-form-item class="threeBtn" v-if="isEdit">
        <el-button type="primary" @click="saveCfg">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// import {reqRoscfg} from "@/api";
import rosCfg from "@/assets/ros.cfg.json";
import { mapState } from "vuex";
export default {
  data() {
    return {
      isEdit:false,
      rosCfg: null,
      form:null,
    };
  },
  computed: {
    ...mapState("ros", ["ros"]),
  },
  mounted() {
    // this.getRoscfg()
    this.getRoscfgs()
  },
  methods: {
    saveCfg() {
      var cfg_pub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/cfg_istring',
        messageType: "std_msgs/String",
      });
      
      var msgJson = JSON.stringify(this.form);
      // console.log(msgJson)
      cfg_pub.publish({data:msgJson});
      // console.log('pub',this.form);

      this.$message({
        type: 'success',
        message: '保存成功!'
      });
      this.isEdit = false;
      this.getRoscfgs();
    },

    getRoscfgs(){
      var cfg_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/cfg_ostring',
        messageType: "std_msgs/String",
      });

      cfg_sub.subscribe((msg)=> {
        this.rosCfg = rosCfg;
        var msgJson = `[${msg.data}]`;
        // console.log(msg.data)
        this.form =JSON.parse(msgJson)[0];
        // console.log('sub',this.form);
      })
    },
    // async getRoscfg(){
    //   var res = await reqRoscfg();
    //   this.rosCfg = rosCfg;
    //   this.form = res.data.data;
    //   console.log(this.form)
    // },
  },
};
</script>

<style scoped>
.el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
  margin-bottom: 2px ;
}
::v-deep .threeBtn .el-form-item__content{
  display: flex;
  justify-content: center;
  margin-top: 15px;
  margin-left: 0 !important;
}
</style>