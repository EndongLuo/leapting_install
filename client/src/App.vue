<template>
  <div id="app">
    <router-view />

    <!-- 弹框 -->
    <el-dialog :visible.sync="dialogs.dialog" width="60%" :title="$t('prompt.prompt')" center :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-size: 24px;">{{ $t(`dialog.${dialogs.text}`) }} <span style="font-weight: 600;"
            v-if="dialogs.seq">{{ dialogs.seq }}mm</span></span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-for="b, i in dialogs.btns" :key="i" @click="diaglogResponse(b)">{{ $t(`dialog.${b}`) }}</el-button>
        <el-button type="primary" @click="dialogfn('confirm')">{{ $t(`mains.confirm`) }}</el-button>
      </span>
    </el-dialog>

    <!-- 诊断日志请求 -->
    <el-dialog :visible.sync="isShowDialog" width="60%" :title="$t('prompt.prompt')" center :append-to-body='true'>
      <!-- <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-size: 24px;" v-if="lang == 'zh'">{{ diaglogRequest.cn }} </span>
        <span style="font-size: 24px;" v-else>{{ diaglogRequest.en }} </span>
      </div> -->
      <swiper class="swiper" :options="swiperOption" ref="mySwiper" @slideChange="onSlideChange">
        <swiper-slide v-for="r in imgData[diaglogRequest.type]" :key="r.id" :id="r.id">
          <p style="font-size: 24px;margin: 10px;">{{ r.title }}</p>
          <img :src="r.url" alt="" style=" height: 300px;">
        </swiper-slide>
        <div class="swiper-pagination" slot="pagination"></div>
      </swiper>

      <span slot="footer" class="dialog-footer">
        <el-button @click="goPrev" :disabled="activeIndex === 0">
          上一步
        </el-button>
        <el-button @click="goNext" :disabled="activeIndex === imgLength">
          下一步
        </el-button>
        <!-- <el-button v-for="b, i in diaglogRequest.btns" :key="i" @click="diaglogResponse(b.en)">{{ lang == 'zh' ? b.cn :
          b.en
        }}</el-button> -->
      </span>
    </el-dialog>
    <!-- <el-dialog :visible.sync="diaglogRequest.dialog" width="60%" :title="$t('prompt.prompt')" center
      :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-size: 24px;" v-if="lang == 'zh'">{{ diaglogRequest.cn }} </span>
        <span style="font-size: 24px;" v-else>{{ diaglogRequest.en }} </span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-for="b, i in diaglogRequest.btns" :key="i" @click="diaglogResponse(b.en)">{{ lang == 'zh' ? b.cn :
          b.en
        }}</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import layout from "./views/layout";
import { mapState } from 'vuex';
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';
export default {
  name: "App",
  components: {
    layout,
  },
  data() {
    return {
      activeIndex: 0,
      lang: localStorage.getItem('languageSet') || 'zh',
      isShowDialog: false,
      imgData: {
        CAMERA: [{
          id: 1,
          url: require('./assets/img/diaglog/CAMERA/CAMERA1.jpg'),
          title: '1.打开柜门'
        }, {
          id: 2,
          url: require('./assets/img/diaglog/CAMERA/CAMERA2.jpg'),
          title: '2.柜子内右侧找到USB HUB'
        }, {
          id: 3,
          url: require('./assets/img/diaglog/CAMERA/CAMERA3.jpg'),
          title: '3.拔插相机线'
        }],
        IMU: [{
          id: 1,
          url: require('./assets/img/diaglog/IMU/1.png'),
          title: '1.打开柜门'
        }, {
          id: 2,
          url: require('./assets/img/diaglog/IMU/2.png'),
          title: '2.柜子内右侧找到USB HUB'
        }, {
          id: 3,
          url: require('./assets/img/diaglog/IMU/3.png'),
          title: '3.拔插IMU线'
        }],
        ARM: [{
          id: 1,
          url: require('./assets/img/diaglog/ARM/1.jpg'),
          title: '1.打开柜门'
        }, {
          id: 2,
          url: require('./assets/img/diaglog/ARM/2.jpg'),
          title: '2.找到示教器'
        }, {
          id: 3,
          url: require('./assets/img/diaglog/ARM/3.jpg'),
          title: '3.按下急停'
        }, {
          id: 4,
          url: require('./assets/img/diaglog/ARM/4.jpg'),
          title: '4.设置手动模式'
        }, {
          id: 5,
          url: require('./assets/img/diaglog/ARM/5.jpg'),
          title: '5.旋钮调整为选定'
        }, {
          id: 6,
          url: require('./assets/img/diaglog/ARM/6.jpg'),
          title: '6.点击R取消选择程序'
        }, {
          id: 7,
          url: require('./assets/img/diaglog/ARM/7.jpg'),
          title: '7.选定cell程序'
        }, {
          id: 8,
          url: require('./assets/img/diaglog/ARM/8.jpg'),
          title: '8.设置外部自动模式'
        }, {
          id: 9,
          url: require('./assets/img/diaglog/ARM/9.jpg'),
          title: '9.旋钮调整为选定'
        }, {
          id: 10,
          url: require('./assets/img/diaglog/ARM/10.jpg'),
          title: '10.松开急停按钮'
        }, {
          id: 11,
          url: require('./assets/img/diaglog/ARM/11.jpg'),
          title: '11.正常启动'
        }],
      },
      swiperOption: {
        // autoplay: {
        //   delay: 10000,
        //   disableOnInteraction: false
        // },
        // loop: true,
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction'
        }
      },
      notification: null
    };
  },
  components: { Swiper, SwiperSlide },
  computed: {
    ...mapState('socket', ['rosConnect', 'dialogs', 'diaglogRequest']),
    imgLength() {
      if (this.diaglogRequest.type) return this.imgData[this.diaglogRequest.type].length - 1;
      return 0;
    }
  },
  mounted() {
    this.$store.dispatch('socket/init');
  },
  watch: {
    diaglogRequest(val) {
      // console.log('diaglogRequest', val);
      if (val.dialog) {
        this.showDialog(val);
      }
    },
    isShowDialog(val) {
      console.log('isShowDialog', val);
      if (val) this.notification.duration = 0;
      else setTimeout(() => {
        this.notification && this.notification.close()
      }, 4500);
    }
  },
  methods: {
    // 点击“上一步”
    goPrev() {
      const swiper = this.$refs.mySwiper.$swiper;;
      if (swiper) swiper.slidePrev();
      this.activeIndex = swiper.activeIndex;
      // console.log('goPrev', this.activeIndex);
    },
    // 点击“下一步”
    goNext() {
      const swiper = this.$refs.mySwiper.$swiper;
      if (swiper) swiper.slideNext();
      this.activeIndex = swiper.activeIndex;
      // console.log('goNext', this.activeIndex);
    },
    onSlideChange() {
      const swiper = this.$refs.mySwiper.$swiper;
      this.activeIndex = swiper.activeIndex;
    },
    /**
   * 通用弹窗通知
   * @param {{ cn: string, en: string, btns: Array<{ en: string }> }} val
   */
    showDialog(val) {
      // console.log(this.notification);

      if (this.notification) return;
      const text = this.lang === 'zh' ? val.cn : val.en;

      const buttonsHtml = val.btns
        .map(
          (b, i) =>
            `<button class="custom-dialog-btn" data-val="${b.en}" style="margin: 10px;background-color: #fff; border:1px solid #409EFF; color: #409EFF; border-radius: 4px; padding: 10px 20px; font-size: 14px; cursor: pointer;">${this.lang === 'zh' ? b.cn : b.en
            }</button>`
        )
        .join('');

      var tuli = `<span style=" color:#409EFF;text-decoration: underline; cursor:pointer" id="show-example-link">图例示教</span>`


      // 先显示通知
      this.notification = this.$notify({
        title: this.$t('prompt.prompt'),
        dangerouslyUseHTMLString: true,
        message: `
      <div id="custom-dialog-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <span style="font-size:16px;">${text} ${this.diaglogRequest.type === '' ? '' : tuli} </span>
        <div style="margin-top: 16px;">
          ${buttonsHtml}
        </div>
      </div>`,
        onClose: () => {
          // 通知关闭后清理引用
          this.notification = null
        }
      });

      // 延迟绑定事件（确保 DOM 已插入）
      this.$nextTick(() => {
        // 为每个按钮添加点击事件
        const wrapper = document.getElementById('custom-dialog-wrapper');
        if (wrapper) {
          wrapper.querySelectorAll('.custom-dialog-btn').forEach((el) => {
            el.addEventListener('click', () => {
              const val = el.dataset.val;
              this.diaglogResponse(val);
              // 关闭 notify
              this.notification.close();
              this.notification = null;
            });
          });

          // 图例示教点击事件
          const link = document.getElementById('show-example-link');
          if (link) {
            link.addEventListener('click', () => {
              this.isShowDialog = true;
              // this.notification.duration = 0;
            });
          }
        }
      });
    },
    // showDialog(val) {
    //   // 根据当前语言选择文本
    //   const text = this.lang === 'zh' ? val.cn : val.en;

    //   // 动态生成按钮的 HTML
    //   const buttonsHtml = val.btns
    //     .map(
    //       (b, i) => `<el-button key="${i}" style="margin: 10px; border:1px solid #409EFF; color: #409EFF; border-radius: 4px; padding: 10px 20px; font-size: 14px; cursor: pointer;" type="primary" onClick="diaglogResponse('${b.en}')">${this.lang === 'zh' ? b.cn : b.en}</el-button>`
    //     )
    //     .join('');

    //   // 一次性调用 notify
    //   this.$notify({
    //     title: this.$t('prompt.prompt'),
    //     dangerouslyUseHTMLString: true,
    //     // duration: 8000,
    //     message: `
    //     <div style="
    //       display: flex;
    //       flex-direction: column;
    //       align-items: center;
    //       justify-content: center;
    //     ">
    //       <span style="font-size:16px;">${text} <span  style=" color:#409EFF;text-decoration: underline; cursor:pointer" onClick="isShowDialog = true">图例示教</span></span>
    //       <div style="margin-top: 16px;">
    //         ${buttonsHtml}
    //       </div>
    //     </div>
    //   `
    //   });
    // },
    dialogfn(val) {
      this.$store.dispatch('socket/sendDialog', val);
    },
    diaglogResponse(val) {
      this.$store.dispatch('socket/diaglogResponse', val);
      this.isShowDialog = false;
    },
  },
};
</script>
<style lang="less" scoped>
.custom-dialog-btn {
  margin: 10px;
  border: 1px solid #409EFF;
  color: #409EFF;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  background-color: #fff;
  cursor: pointer;
}

.s_a {
  cursor: pointer;
  color: #409EFF;

  &:hover {
    text-decoration: underline;
  }
}

.swiper-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.swiper-pagination-fraction,
.swiper-pagination-custom,
.swiper-container-horizontal>.swiper-pagination-bullets {
  bottom: 0px;
  // mix-blend-mode: difference;
  // mix-blend-mode: darken;
  background-color: #fff;
}
</style>