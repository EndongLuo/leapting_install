import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

import router from '@/router';
import store from '@/store';

// 清除默认样式的css
import '@/assets/css/common.css';
import '@/styles/index.css'; // global css
// flexible、fastclick工具包
import '@/utils/flexible';
import '@/utils/fastclick';

//引入全部的请求函数
import * as API from '@/api';
// 引入ElementUI
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
ElementUI.Dialog.props.closeOnClickModal.default = false;
Vue.use(ElementUI);

import "leaflet/dist/leaflet.css";

// import echarts from "echarts";
// Vue.prototype.$echarts = echarts;

// 移动端打印
import vConsole from 'vconsole';
// Vue.prototype.$vConsole = new vConsole();

// import VForm from 'vform-builds'  //引入VForm库
// import 'vform-builds/dist/VFormDesigner.css'  //引入VForm样式
// Vue.use(VForm)  //全局注册VForm

import i18n from './components/language';//中英文切换

new Vue({
  router,
  store,
  i18n, 
  render: h => h(App),
  beforeCreate() {
    Vue.prototype.$bus = this;
    Vue.prototype.$API = API;
  },
}).$mount('#app');
