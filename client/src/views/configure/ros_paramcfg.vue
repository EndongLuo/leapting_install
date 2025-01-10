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
          <el-button @click="HandEye(false)">{{ $t('config.noautohandeye') }}</el-button>
          <el-button @click="HandEye(true)">{{ $t('config.autohandeye') }}</el-button>
        </div>

        <div class="inbox">
          <span style="width: 100px;">{{ $t('config.git') }}：
            <span v-if="gitNum" style="margin-left: 10px;color: #949494; font-size: 13px;"> {{ gitNum }} </span>
          </span>
          <el-button @click="gitPull">{{ $t('config.update') }}</el-button>
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
      robot: {}
    };
  },
  computed: {
    ...mapState("socket", ['battery', 'gitNum', 'gitFeedback']),
  },
  async created() {
    var res = await getRobot();
    this.robot = res.data[0];
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
    }
  },
  methods: {
    async upDataPVM() {
      var res = await updateRobot(this.robot);

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
      this.$store.dispatch("socket/HandEye", b);
    },
    gitPull() {
      this.$store.dispatch("socket/git");

      const loading = this.$loading({
        lock: true,
        text: 'Updating...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      if (this.gitFeedback) this.$message.success(`Update success!`);
      else this.$message.error(`Update failed!`);
      loading.close();

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
  width: 50%;
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