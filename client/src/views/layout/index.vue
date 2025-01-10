<template>
  <el-container>
    <el-container>
      <!-- 头部 -->
      <el-header style="height: 60px; border-bottom: 1px solid #000;">
        <div class="header_inner">
          <div class="logo"><img src="@/assets/logo.png" alt="logo" @click="fullscreenChange"></div>

          <div class="header_right">
            <router-link to="/" v-if="isIndex"><i class=" el-icon-setting menu_font"
                @click="changeIndex(0)"></i></router-link>
            <router-link to="/ros_paramcfg" v-else><i class="el-icon-back menu_font"
                @click="changeIndex(1)"></i></router-link>
          </div>

        </div>
      </el-header>

      <!-- 主要内容-路由组件 -->
      <el-main>
        <keep-alive include="home" exclude="home">
          <router-view></router-view>
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "layout",
  data() {
    return {
      themes: 'white',
      isIndex: Number(localStorage.getItem('isIndex')),
    };
  },
  computed: {
    theme: {
      get() {
        return this.$store.state.setting.theme;
      },
      set(val) {
        this.$store.dispatch('setting/changeSetting', {
          key: 'theme',
          value: val,
          cache: 'THEME'
        });
        document.getElementsByTagName('body')[0].className = `leapting-admin-${val}Theme`;
      }
    },
  },
  created() {
    if (this.theme) {
      document.getElementsByTagName('body')[0].className = `leapting-admin-${this.theme}Theme`;
    }
  },
  mounted() {
    // 快捷键判断
    window.onkeydown = (e) => this.keyJudgment(e);

    // 判断全屏状态
    this.isFullscreen = this.isFullScreens()
    window.onresize = () => this.isFullscreen = this.isFullScreens();
  },
  methods: {
    changeIndex(index) {
      this.isIndex = index;
      localStorage.setItem('isIndex', index);
    },
    changeLanguage() {
      this.$i18n.locale == 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'   //设置中英文模式
      localStorage.setItem('languageSet', this.$i18n.locale)   //将用户设置存储到localStorage以便用户下次打开时使用此设置
    },

    // 判断是否为全屏
    isFullScreens() {
      return (
        document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        false
      )
    },

    // F11快捷键判断
    keyJudgment(e) {
      const keyCode = e.keyCode || e.which || e.charCode
      const altKey = e.altKey
      const shiftKey = e.shiftKey
      const ctrlKey = e.ctrlKey
      if (!altKey && !ctrlKey && !shiftKey && keyCode === 122) {
        this.fullscreenChange()
        e.preventDefault()
        return
      }
    },

    // 全屏切换
    fullscreenChange() {
      console.log(1)
      this.isFullscreen = !this.isFullscreen
      const el = document.documentElement
      if (this.isFullscreen) {
        const rfs =
          el.requestFullScreen ||
          el.webkitRequestFullScreen ||
          el.mozRequestFullScreen ||
          el.msRequestFullscreen
        if (typeof rfs !== undefined && rfs) {
          rfs.call(el)
        }
        return
      } else {
        const newRFS =
          document.exitFullscreen ||
          document.msExitFullscreen ||
          document.mozCancelFullScreen ||
          document.webkitExitFullscreen
        newRFS.call(document)
      }
    }
  },
};
</script>

<style lang="less">
.menu_right {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.el-menu {
  background-color: #ffffff00 !important;
}

.el-menu-demo {
  display: flex;
  align-items: center;
  width: 100%;
}

.el-menu-item {
  font-size: 18px !important;
  font-weight: 700 !important;
}

.el-menu.el-menu--horizontal {

  border-bottom: solid 1px #66b1ff !important;

  a {
    color: #0e0e0eec !important;
  }
}

.el-menu--horizontal>.el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal>.el-menu-item:not(.is-disabled):hover,
.el-menu--horizontal>.el-submenu .el-submenu__title:hover {
  background-color: #3994fc85 !important;
  // background-color: #222222 !important;
}

.el-drawer__header {
  font-size: 18px;
  padding: 20px !important;
  border-bottom: #b4b8bf 1px solid;
}

.drawer-main {
  margin-left: 20px;
}

// @media screen and (max-width: 768px) {
@media screen and (max-width: 1000px) {
  font-size: 18px;

  .el-menu-vertical:not(.el-menu--collapse) {
    position: absolute;
    left: 0px;
    scrollbar-width: none;
    /* Firefox */
  }

  .el-menu-vertical:is(.el-menu--collapse) {
    position: absolute;
    left: -60px;
    // display: none;
    z-index: -9999;
    width: 0px;
  }

  ::-webkit-scrollbar {
    display: none;
    /* Chrome Safari */
  }

  .bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.3);
  }
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
  z-index: 100;
  height: 100vh;
}

.el-menu-vertical:is(.el-menu--collapse) {
  height: 100vh;
}

.logo {
  height: 50px;
  display: flex;
  justify-content: center;

  img {
    height: 100%;
  }
}

.el-header {
  // border-bottom: #858585 solid 1px;
  position: relative;
  padding: 0 10px !important;
}

.el-footer {
  text-align: center;
  line-height: 60px;
}

.header_inner {
  display: flex;
  align-items: center;
  height: 60px;
}

.collapse-btn {
  font-size: 36px;
}

.fullscreen {
  display: flex;
  align-items: center;
  width: 40px;
  height: 36px;
  cursor: pointer;
  font-size: 32px;
}

.menu_font {
  color: #000000;
  font-size: 36px;
}

.header_right {
  display: flex;
  align-items: center;
  position: absolute;
  right: 20px;
  cursor: pointer;
}

.el-dropdown {
  height: 36px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.el-aside {
  z-index: 1001;
}

.el-main {
  padding: 10px !important;
  // border-left: solid 2px #e6e6e667; 
  background-color: #ffffff00 !important;
}
</style>
