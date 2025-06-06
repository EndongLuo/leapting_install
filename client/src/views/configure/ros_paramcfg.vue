<template>
  <div class="setting">

    <!-- 电量，避障，组件尺寸 -->
    <div class="pduControl">
      <h1 class="title">{{ $t('config.pvmParam') }}</h1>
      <div class="outbox">
        <div class="inbox">
          <span class="param_name">{{ $t('config.pvmsize') }}(mm)：</span>
          <div class="param_set">
            <div> <el-input  v-model="robot.pvmheight" @blur="upDataPVM"></el-input></div>
            <div> <el-input  v-model="robot.pvmwidth" @blur="upDataPVM"></el-input></div>
            <div> <el-input  v-model="robot.pvm_thickness" @blur="upDataPVM"></el-input></div>
          </div>
        </div>
        <div class="inbox">
          <span class="param_name">{{ $t('config.line_gap') }}(mm)：</span>
          <div class="param_set">
            <div class="input_info"><el-input v-model="robot.line_gap" @blur="upDataPVM"></el-input></div>
            <div class="btn"><el-button plain size="mini" type="primary" @click="showTuli('line_gap')">图例示教</el-button></div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.cell_length') }}(mm)：</span>
          <div class="param_set">
            <div class="input_info"> <el-input v-model="robot.cell_length" @blur="upDataPVM"></el-input></div> 
            <div class="btn"> <el-button plain size="mini" type="primary" @click="showTuli('cell_length')">图例示教</el-button></div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.pvmedge_hole_gap') }}(mm)：</span>
          <div class="param_set">
            <div class="input_info"> <el-input v-model="robot.pvmedge_hole_gap" @blur="upDataPVM"></el-input></div>
            <div class="btn"> <el-button plain size="mini" type="primary" @click="showTuli('pvmedge_hole_gap')">图例示教</el-button></div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.hole_gap') }}(mm)：</span>
          <div  class="param_set" >
            <div class="input_info"><el-input v-model="robot.hole_gap" @blur="upDataPVM"></el-input></div>
            <div class="btn"><el-button plain size="mini" type="primary" @click="showTuli('hole_gap')">图例示教</el-button></div>
          </div>
        </div>

      </div>

      <h1 class="title">{{ $t('config.CalibrationParam') }}</h1>
      <div class="outbox">
        <div class="inbox">
          <span class="param_name">{{ $t('config.cuplength') }}(mm)：</span>
          <div class="param_set">
            <div class="input_info"><el-input v-model="robot.cuplength" @blur="upDataPVM"></el-input></div>
            <div class="btn"><el-button plain size="mini" type="primary" @click="showTuli('cuplength')">图例示教</el-button></div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.uninstall_z') }}(mm)：</span>
          <div class="param_set">
            <div class="input_info"><el-input v-model="robot.uninstall_z" @blur="upDataPVM"></el-input> </div>
            <div class="btn"><el-button plain size="mini" type="primary">图例示教</el-button></div>
          </div>
        </div>
      </div>

      <h1 class="title">{{ $t('config.basecontrol') }}</h1>
      <div class="outbox">
        <!-- <div class="inbox">
          <span style="width: 232px;">{{ $t('config.robotName') }}(mm)：</span>
          <el-switch v-model="robot.status" @change="upDataPVM" active-value="1" inactive-value="0"> </el-switch>
          <el-input style="margin-left: 10px;" v-model="robot.bridgegap" @blur="upDataPVM"></el-input>
        </div> -->

        <div class="inbox">
          <span class="param_name">{{ $t('config.obstacle') }}：</span>
          <div class="param_set">
            <div class="input_info"><el-input v-model="obstacleLength"  @blur="updateObstacleEnable"><template slot="append">m</template></el-input></div>
            <div class="btn"><el-switch v-model="obstacleEnable" @change="obstacleSet" active-value="1" inactive-value="0" style="margin-right: 10px;"></el-switch>{{ obstacleEnable == 1  ? '已开' : '已禁' }}</div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.reminder') }}：</span>
          <div  class="param_set" >
            <div class="input_info"><el-slider v-model="robot.reminder" @change="upDataPVM" :step="5"></el-slider></div>
            <div style="margin-left: 10px;">{{ robot.reminder }}%</div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.handeye') }}：</span>
          <div class="param_set" >
            <div class="input_info" style="display: flex; align-items: center; justify-content:space-between;">
              <span><el-checkbox v-model="mirrorChecked">{{ $t('config.mirror')}}</el-checkbox></span>
              <span style="width: 100px; margin-left: 10px;"><el-slider v-model="HandEyeData" range show-stops :max="55" :min="1"> </el-slider></span>
              <el-button size="mini" @click="HandEye(true)"  style="margin-left: 10px;">{{ $t('config.autohandeye') }}</el-button>
            </div>
            <div class="btn"><el-button plain size="mini" type="primary" @click="showTuli('autohandeye')">图例示教</el-button></div>
          </div>
          <!-- <el-button @click="HandEye(false)" style="margin-left: 10px;">{{ $t('config.noautohandeye') }}</el-button> -->
        </div>

       
        <div class="inbox">
          <span class="param_name">{{ $t('config.git') }}：</span>
          <div  class="param_set" >
            <div class="input_info" style="display: flex; align-items: center; justify-content:space-between;">
              <span v-if="tag" style="color: #949494; font-size: 14px;"> {{ tag }} </span>
              <span> <i class="el-icon-warning-outline" style="font-size: 20px; margin-right: 10px;" @click="gitInfoDialogVisible = true"></i></span>
              <el-button size="mini" @click="gitPull()">{{ $t('config.update') }}</el-button>
            </div>
            <div class="btn"><el-button size="mini" @click="isOfflineUpdateShow" style="margin-right: 10px;">{{ $t('config.offlineUpdate') }}</el-button></div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.gitSwitch') }}：</span>
          <div  class="param_set" >
            <div class="input_info">
              <el-select v-model="t" :placeholder="$t('config.switchGit')">
                <el-option v-for="item in tags" :key="item" :label=item :value=item></el-option>
              </el-select>
            </div>
            <div class="btn"><el-button size="mini" @click="gitPull(t)">{{ $t('config.switch') }}</el-button></div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.language') }}：</span>
          <div  class="param_set">
            <div class="input_info">
              <el-select v-model="language" placeholder="Language" @change="changeLanguage">
                <el-option :label="$t('config.chinese')" value="zh"></el-option>
                <el-option :label="$t('config.english')" value="en"></el-option>
              </el-select>
            </div>
          </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.video') }}：</span>
          <div  class="param_set" > <el-switch v-model="robot.video" @change="upDataPVM" active-value="1" inactive-value="0"> </el-switch> </div>
        </div>

        <div class="inbox">
          <span class="param_name">{{ $t('config.reboot1') }}：</span>
          <div  class="param_set" >
            <div class="input_info"><el-button size="mini" type="danger" @click="reboot">{{ $t('config.reboot') }}</el-button></div>
          </div>
        </div>

      </div>

    </div>

    <el-dialog :title="$t('config.gitInfo')" :visible.sync="gitInfoDialogVisible" width="60%" center
      :close-on-click-modal="false">
      <div v-if="gitInfo" style="font-size: 18px;">
        <div style="margin: 10px;"><span style="font-weight: 700;margin: 10px;">{{ $t('config.git') }}：</span>{{ tag }}
        </div>

        <div style="margin: 10px;"><span style="font-weight: 700;margin: 10px;">更新时间：</span>{{ gitInfo.date }}</div>
        <!-- <div style="margin: 10px;"><span style="font-weight: 700;margin: 10px;">HEAD码：</span>{{ gitInfo.head }}</div> -->
        <div style="margin: 10px;"><span style="font-weight: 700;margin: 10px;">更新内容：</span>{{ gitInfo.msg }}</div>
      </div>
    </el-dialog>

    <el-dialog :title="$t('prompt.prompt')" :visible.sync="tuliShow" width="80%" center :close-on-click-modal="false">
      <div style="text-align: center; height: 430px;">
        <img class="tuliImg" style="height: 100%; width: 100%;" :src="tuliPath" />
      </div>
    </el-dialog>

    <el-dialog :title="$t('prompt.confirmUpdateType')" :visible.sync="offlineUpdateShow" width="80%" center :close-on-click-modal="false">
      <div style="display: flex; justify-content: center;">
        <el-button type="primary" @click="offlineUpdate('update_git')">{{ $t('prompt.gitUpdated') }}</el-button>
        <el-button type="primary" @click="offlineUpdate('update_all')">{{ $t('prompt.allUpdated') }}</el-button>
        <el-button type="primary" @click="offlineUpdate('update')">{{ $t('prompt.partiallyUpdated') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapState } from "vuex";
import { getRobot, updateRobot } from '@/api';
export default {
  data() {
    return {
      language: this.$i18n.locale,
      robot: {},
      t: '',
      HandEyeData: [1, 55],
      mirrorChecked: false,
      gitInfoDialogVisible: false,
      tuliShow: false, 
      tuliPath: '',
      obstacleLength: 2.5,
      obstacleEnable: 0,
      offlineUpdateShow: false
    };
  },
  computed: {
    ...mapState("socket", ['battery', 'databaseUpdate', 'tag', 'gitFeedback', 'tags', 'gitInfo']),
    
  },
  async created() {
    this.getRobot();
    this.obstacleEnable = localStorage.getItem('obstacleEnable');
    this.obstacleLength = localStorage.getItem('obstacleLength');
    this.$store.dispatch('socket/obstacleUpdate', {enable: this.obstacleEnable == 1 ? true : false , distance: Number(this.obstacleLength)});
  },
  watch: {
    battery(val, oldval) {
      // console.log(val, oldval, this.robot.reminder);

      if (val < this.robot.reminder) {
        console.log('电量低');

        this.$notify({
          title: 'Warning',
          message: 'Battery is low, please charge the robot as soon as possible!',
          type: 'warning'
        });
      }
    },
    tag(val, oldval) {
      console.log(val, oldval);
      if (val !== oldval && oldval) {
        if (this.gitFeedback) this.$message.success(`${this.$t('prompt.updateSuccess')}`);
        else this.$message.error(`${this.$t('prompt.updateFailed')}`);
        this.loading.close();
      }
    },
    databaseUpdate(val, oldval) {
      // console.log(val, oldval);
      if (val) this.getRobot();
      this.$store.dispatch("socket/statusUpdate");
    }
  },
  methods: {
    reboot() {
      this.$confirm(`${this.$t('prompt.confirmReboot')}`, `${this.$t('prompt.prompt')}`, {
        confirmButtonText: `${this.$t('mains.confirm')}`,
        cancelButtonText: `${this.$t('mains.cancel')}`,
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: `${this.$t('config.reboot')}`
        });
        // console.log('重启');
        var taskmsg = { task_status: -1, task_name: 'reboot' };
        this.$store.dispatch('socket/sendTask', taskmsg);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: `${this.$t('prompt.cancelReboot')}`
        });
      });
    },
    // 获取robot参数
    async getRobot() {
      var res = await getRobot();
      this.robot = res.data[0];
      this.$set(this.robot, 'video', String(this.robot.video));
      this.$set(this.robot, 'status', String(this.robot.status));
      localStorage.setItem('video', this.robot.video);
    },

    // 更新robot参数
    async upDataPVM() {
      var res = await updateRobot(this.robot);
      localStorage.setItem('video', this.robot.video);

      if (res.code == 200) this.$message.success(`${this.$t('prompt.updateSuccess')}`);
      else this.$message.error(`${this.$t('prompt.updateFailed')}`);
    },

    // 切换语言
    changeLanguage() {
      this.$i18n.locale == 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'   //设置中英文模式
      localStorage.setItem('languageSet', this.$i18n.locale)   //将用户设置存储到localStorage以便用户下次打开时使用此设置
    },

    // 发送goal
    HandEye(b) {
      var data = {
        if_auto_all: b,
        start_site: this.HandEyeData[0],
        end_site: this.HandEyeData[1],
        mirror: this.mirrorChecked
      }
      // this.$store.dispatch("socket/HandEye", data);
      var taskmsg = { id: -1, task_name: `${JSON.stringify(data)}`, task_type: 4, task_status: 1 };
      this.$store.dispatch('socket/sendTask', taskmsg);
      this.$router.push('/');
    },

    // 版本更新
    gitPull(t) {
      if (t == this.tag) {
        this.$message.error(`${this.$t('prompt.noSwitch')} ${this.tag}`);
        return;
      }
      this.$store.dispatch("socket/git", t);

      this.loading = this.$loading({
        lock: true,
        text: 'Updating...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      if (this.tag == this.tags[0] && t == '') {
        if (this.gitFeedback) this.$message.success(`${this.$t('prompt.updateSuccess')}`);
        else this.$message.error(`${this.$t('prompt.updateFailed')}`);
        this.loading.close();
      }
    },

    //U盘更新
    isOfflineUpdateShow(){
      this.offlineUpdateShow = true;
    },

    offlineUpdate(type){
      this.$store.dispatch('socket/offlineUpdate', type);
      this.offlineUpdateShow = false;
    },

    showTuli(name){
      this.tuliPath = '';
      this.tuliPath = require(`@/assets/img/diaglog/params/${name}.jpg`)
      this.tuliShow = true;
    },

    updateObstacleEnable(){
      localStorage.setItem('obstacleLength', this.obstacleLength);
      this.$store.dispatch('socket/obstacleUpdate', {enable: this.obstacleEnable == 1 ? true : false , distance: Number(this.obstacleLength)});
      this.$message.success(`${this.$t('prompt.updateSuccess')}`);
    },

    obstacleSet(val) {
      // 1 enable, 0 disenable
      localStorage.setItem('obstacleEnable', val);
      this.$store.dispatch('socket/obstacleUpdate', {enable: this.obstacleEnable == 1 ? true : false , distance: Number(this.obstacleLength)});
    }
  },
};
</script>

<style lang="less" scoped>
.setting {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pduControl {
  width: 60%;
  height: 100%;
  margin-top: -10px;
  padding: 30px 40px;
  border-radius: 5px;
  background: #cccccc50;
  box-shadow: 0px 0px 10px #7f7f7f69;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  font-weight: 700;

  .title {
    margin: 5px;
    font-size: 18px;
    font-weight: 700;
  }

  .outbox1 {
    font-size: 16px;
  }

  .outbox {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    flex-direction: column;
    width: 100%;

    .inbox {
      display: flex;
      align-items: center;
      width: 100%;
      margin: 10px 20px;

      .param_name{
        width: 140px;
      }

      .param_set{
        display: flex;
        width: calc(100% - 200px);
        align-items:center;
        
        .input_info{
          width: 70%;
        }

        .btn{
          margin-left: 10px;
        }
      }
      ::v-deep .el-input__inner{
        height: 28px;
        line-height: 28px;
      }
      ::v-deep .el-input__icon{
        line-height: 28px;
      }
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
}
</style>
