<template>
  <el-container>
    <el-container>
      <!-- 头部 -->
      <el-header style="height: 60px">
        <div class="header_inner">
          <!-- <div class="logo"><img  src="@/assets/logo.png" alt="logo" /></div> -->

          <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
            <div class="logo"><img src="@/assets/logo.png" alt="logo" /></div>

            <el-menu-item index="1" @click="activeIndex='1'"><router-link to="/">{{$t('nav.index')}}</router-link></el-menu-item>
            <el-menu-item index="2" @click="activeIndex='2'"><router-link to="/map">{{$t('nav.map')}}</router-link></el-menu-item>
            <el-menu-item index="3" @click="activeIndex='3'"><router-link to="/behaviorInfo">{{$t('nav.task')}}</router-link></el-menu-item>
            <el-menu-item index="4" @click="activeIndex='4'"><router-link to="/diagnostics">{{$t('nav.diagnostic')}}</router-link></el-menu-item>
            <!-- <el-menu-item index="5"><router-link to="/ros_paramcfg">{{$t('nav.config')}}</router-link></el-menu-item> -->
          </el-menu>

          <div class="header_right">
            <i class="iconfont icon-shezhi" style="width: 30px; height: 30px; margin-right: 10px; cursor: pointer;"></i>
            <img src="/img/znen.png" alt="中/En" @click="changeLanguage()" style="width: 30px; height: 30px; margin-right: 10px; cursor: pointer;">
            <Fullscreen />
            <router-link to="/ros_paramcfg"><img src="/img/setting.png" :alt="$t('nav.config')"  @click="activeIndex='0'" style="width: 30px; height: 30px; margin-right: 10px; cursor: pointer;"></router-link>
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
import users from "@/views/users";
import Fullscreen from "@/components/Fullscreen";
import { setCache, getCache } from "@/utils/session";

export default {
  name: "layout",
  components: { users, Fullscreen },
  data() {
    return {
      themes: 'white',
      activeIndex: '1',
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
    if (getCache('activeIndex')) this.activeIndex = getCache('activeIndex');
  },
  methods: {
    changeLanguage() {
      this.$i18n.locale == 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'   //设置中英文模式
      localStorage.setItem('languageSet', this.$i18n.locale)   //将用户设置存储到localStorage以便用户下次打开时使用此设置
    },

    handleSelect(key, keyPath) {
      setCache('activeIndex', key)
    }
  },
};
</script>

<style lang="less">
.el-menu{
  background-color: #ffffff00 !important;
}
.el-menu-demo {
  display: flex;
  align-items: center;
  width: 100%;
}
.el-menu-item{
  font-size: 18px !important;
  font-weight: 700 !important;
}

.el-menu.el-menu--horizontal {
  border-bottom: solid 1px #66b1ff !important;
}

.el-menu--horizontal>.el-menu-item:not(.is-disabled):focus, .el-menu--horizontal>.el-menu-item:not(.is-disabled):hover, .el-menu--horizontal>.el-submenu .el-submenu__title:hover {
    background-color: #ffffff85 !important;
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
  padding: 8px;
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

.header_right {
  display: flex;
  align-items: center;
  position: absolute;
  right: 20px;
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
}</style>
