<template>
  <div class="setting">

    <!-- 电量，避障，组件尺寸 -->
    <div class="pduControl">
      <h1 class="title">{{ $t('config.basecontrol') }}</h1>
      <div class="outbox">
        <div class="inbox">
          <span style="width: 386px;">{{ $t('config.pvmsize') }}(mm)：</span>
          <el-input v-model="robot.pvmheight" @blur="upDataPVM"></el-input>
          <el-input v-model="robot.pvmwidth" @blur="upDataPVM"></el-input>
        </div>
        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.installgap') }}(mm)：</span>
          <el-input v-model="robot.installgap" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.cuplength') }}(mm)：</span>
          <el-input v-model="robot.cuplength" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span style="width: 232px;">{{ $t('config.bridgegap') }}(mm)：</span>
          <el-switch v-model="robot.status" @change="upDataPVM" active-value="1" inactive-value="0"> </el-switch>
          <el-input style="margin-left: 10px;" v-model="robot.bridgegap" @blur="upDataPVM"></el-input>
        </div>

        <div class="inbox">
          <span style="width: 100px;">{{ $t('config.video') }}：</span>
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
          <span style="width: 80px; margin-left: 10px;"><el-slider v-model="HandEyeData" range show-stops :max="55"
              :min="1">
            </el-slider></span>
          <span style="margin-left: 15px;"><el-checkbox v-model="mirrorChecked">{{ $t('config.mirror')
          }}</el-checkbox></span>
          <el-button @click="HandEye(false)" style="margin-left: 10px;">{{ $t('config.noautohandeye') }}</el-button>
          <el-button @click="HandEye(true)">{{ $t('config.autohandeye') }}</el-button>
        </div>

        <div class="inbox">
          <span style="width: 100px;">{{ $t('config.git') }}：
            <span v-if="tag" style="margin-left: 10px; color: #949494; font-size: 13px;"> {{ tag }} </span>
          </span>
          <el-button @click="gitPull()" style="margin-right: 10px;">{{ $t('config.update') }}</el-button>
          <el-select v-model="t" :placeholder="$t('config.switchGit')">
            <el-option v-for="item in tags" :key="item" :label=item :value=item></el-option>
          </el-select>
          <el-button @click="gitPull(t)">{{ $t('config.switch') }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getRobot, updateRobot } from '@/api';
export default {
  data() {
    return {
      language: this.$i18n.locale,
      robot: {
        video: 0,
        reminder: 30,
        pvmheight: 0,
        pvmwidth: 0,
        installgap: 0,
        cuplength: 0,
        bridgegap: 0,
        status: 0
      },
      t: '',
      HandEyeData: [1, 55],
      mirrorChecked: false
    };
  },
  computed: {
    ...mapState("socket", ['battery', 'tag', 'gitFeedback', 'tags']),
  },
  async created() {
    var res = await getRobot();
    this.robot = res.data[0];
    this.$set(this.robot, 'video', String(this.robot.video));
    this.$set(this.robot, 'status', String(this.robot.status));
    localStorage.setItem('video', this.robot.video);   //将用户设置存储到localStorage以便用户下次打开时使用此设置
    // console.log(this.robot);
    
  },
  watch: {
    battery(val, oldval) {
      console.log(val, oldval, this.robot.reminder);

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
      // console.log(val, oldval);
      if (val !== oldval) {
        if (this.gitFeedback) this.$message.success(`Update success!`);
        else this.$message.error(`Update failed!`);
        this.loading.close();
      }
    }
  },
  methods: {
    async upDataPVM() {
      var res = await updateRobot(this.robot);
      localStorage.setItem('video', this.robot.video);

      if (res.code == 200) {
        this.$message.success('Update success!');
      } else {
        this.$message.error('Update failed!');
      }
    },
    changeLanguage() {
      this.$i18n.locale == 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'   //设置中英文模式
      localStorage.setItem('languageSet', this.$i18n.locale)   //将用户设置存储到localStorage以便用户下次打开时使用此设置
    },
    // 发送goal
    HandEye(b) {
      // arg_keys: ['if_auto_all', 'start_site', 'end_site', 'mirror'],
      //   arg_values: [`${d.if_auto_all}`, `${d.start_site}`, `${d.end_site}`, `${d.mirror}`]
      var data = {
        if_auto_all: b,
        start_site: this.HandEyeData[0],
        end_site: this.HandEyeData[1],
        mirror: this.mirrorChecked
      }
      this.$store.dispatch("socket/HandEye", data);
    },
    gitPull(t = '') {
      if (t == this.tag) {
        this.$message.error(`当前版本为： ${this.tag}, 无需切换`);
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
        if (this.gitFeedback) this.$message.success(`Update success!`);
        else this.$message.error(`Update failed!`);
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
  height: 90vh;
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
    margin: 15px;
    font-size: 20px;
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