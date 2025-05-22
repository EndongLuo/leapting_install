<template>
  <div class="setting">

    <!-- 电量，避障，组件尺寸 -->
    <div class="pduControl">
      <h1 class="title">{{ $t('config.pvmParam') }}</h1>
      <div class="outbox">
        <div class="inbox">
          <span style="width: 386px;">{{ $t('config.pvmsize') }}(mm)：</span>
          <el-input v-model="robot.pvmheight" @blur="upDataPVM"></el-input>
          <el-input v-model="robot.pvmwidth" @blur="upDataPVM"></el-input>
          <el-input v-model="robot.pvm_thickness" @blur="upDataPVM"></el-input>
        </div>
        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.line_gap') }}(mm)：</span>
          <el-input v-model="robot.line_gap" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.cell_length') }}(mm)：</span>
          <el-input v-model="robot.cell_length" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.pvmedge_hole_gap') }}(mm)：</span>
          <el-input v-model="robot.pvmedge_hole_gap" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.hole_gap') }}(mm)：</span>
          <el-input v-model="robot.hole_gap" @blur="upDataPVM"></el-input>
        </div>

      </div>

      <h1 class="title">{{ $t('config.CalibrationParam') }}</h1>
      <div class="outbox">
        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.cuplength') }}(mm)：</span>
          <el-input v-model="robot.cuplength" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.uninstall_z') }}(mm)：</span>
          <el-input v-model="robot.uninstall_z" @blur="upDataPVM"></el-input>
        </div>
      </div>

      <h1 class="title">{{ $t('config.basecontrol') }}</h1>
      <div class="outbox">
        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.bridgegap') }}(mm)：</span>
          <el-switch v-model="robot.status" @change="upDataPVM" active-value="1" inactive-value="0"> </el-switch>
          <el-input style="margin-left: 10px;" v-model="robot.bridgegap" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span>{{ $t('config.video') }}：</span>
          <el-switch v-model="robot.video" @change="upDataPVM" active-value="1" inactive-value="0"> </el-switch>
        </div>

        <div class="inbox">
          <span>{{ $t('config.reminder') }}：</span>
          <div style="width: 200px;"><el-slider v-model="robot.reminder" @change="upDataPVM" :step="5"></el-slider>
          </div>
          <div style="margin-left: 10px;">{{ robot.reminder }}%</div>
        </div>

        <div class="inbox">
          <span>{{ $t('config.language') }}：</span>
          <el-select v-model="language" placeholder="Language" @change="changeLanguage">
            <el-option :label="$t('config.chinese')" value="zh"></el-option>
            <el-option :label="$t('config.english')" value="en"></el-option>
          </el-select>
        </div>

        <div class="inbox">
          <span>{{ $t('config.handeye') }}：</span>
          <span style="width: 100px; margin-left: 10px;"><el-slider v-model="HandEyeData" range show-stops :max="55"
              :min="1">
            </el-slider></span>
          <span style="margin-left: 15px;"><el-checkbox v-model="mirrorChecked">{{ $t('config.mirror')
          }}</el-checkbox></span>
          <!-- <el-button @click="HandEye(false)" style="margin-left: 10px;">{{ $t('config.noautohandeye') }}</el-button> -->
          <el-button @click="HandEye(true)"  style="margin-left: 10px;">{{ $t('config.autohandeye') }}</el-button>
        </div>

       
        <div class="inbox">
          <span style="width: 100px;">{{ $t('config.git') }}：
            <span v-if="tag" style="margin-left: 10px; color: #949494; font-size: 13px;"> {{ tag }} </span>
          </span>
          <span>
            <i class="el-icon-warning-outline" style="font-size: 24px; margin-right: 10px;"
              @click="gitInfoDialogVisible = true"></i>
          </span>
          <el-button @click="gitPull()" style="margin-right: 10px;">{{ $t('config.update') }}</el-button>
          <el-select v-model="t" :placeholder="$t('config.switchGit')">
            <el-option v-for="item in tags" :key="item" :label=item :value=item></el-option>
          </el-select>
          <el-button @click="gitPull(t)">{{ $t('config.switch') }}</el-button>
        </div>

        <div class="inbox">
          <span style="width: 100px;">{{ $t('config.reboot1') }}：</span>
          <el-button type="danger" @click="reboot">{{ $t('config.reboot') }}</el-button>
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
    };
  },
  computed: {
    ...mapState("socket", ['battery', 'databaseUpdate', 'tag', 'gitFeedback', 'tags', 'gitInfo']),
  },
  async created() {
    this.getRobot();
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
    margin: 20px;
    font-size: 24px;
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
      margin: 10px 20px;
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