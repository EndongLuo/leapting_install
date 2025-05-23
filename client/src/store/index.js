import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';

Vue.use(Vuex);

//导入modules文件夹下所有的js文件
// const modulesFiles = require.context('./modules', true, /\.js$/);

// const modules = modulesFiles.keys().reduce((modules, modulePath) => {
//   const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
//   const value = modulesFiles(modulePath);
//   modules[moduleName] = value.default;
//   return modules;
// }, {});

// export default new Vuex.Store({ modules, getters });


import user from './modules/user';
import ros from './modules/ros';
import socket from './modules/socket';
import setting from './modules/setting';

export default new Vuex.Store({
  modules: {
    user,
    ros,
    setting,
    socket
  },
});
