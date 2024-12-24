// import {
//   reqGetCode,
//   reqUserRegister,
//   reqUserLogin,
//   reqUserInfo,
//   reqLogout,
// } from '@/api';
// import { setToken, getToken, clearToken } from '@/utils/token';

// const actions = {
//   // 获取验证码
//   async getCode({ commit }, phone) {
//     let res = await reqGetCode(phone);
//     if (res.data.code == 200) {
//       commit('GETCODE', res.data.data);
//       return 'ok';
//     } else {
//       return Promise.reject(new Error('fail'));
//     }
//   },

//   // 用户注册
//   async userRegister({ commit }, data) {
//     let res = await reqUserRegister(data);
//     // console.log(res.data);
//     if (res.data.code == 200) return 'ok';
//     else Promise.reject(new Error('fail'));
//   },

//   // 用户登录
//   async userLogin({ commit }, data) {
//     let res = await reqUserLogin(data);
//     if (res.data.code == 200) {
//       commit('USERLOGIN', res.data.data.token);
//       setToken(res.data.data.token);
//       return 'ok';
//     } else {
//       Promise.reject(new Error('fail'));
//     }
//   },

//   // 获取用户信息
//   async getUserInfo({ commit }) {
//     let res = await reqUserInfo();
//     if (res.data.code == 200) {
//       commit('GETUSERINFO', res.data.data);
//       return 'ok';
//     } else {
//       Promise.reject(new Error('fail'));
//     }
//   },
//   // 退出登录
//   async userLogout({ commit }) {
//     //发请求通知服务器销毁token
//     let res = await reqLogout();
//     if (res.data.code == 200) {
//       commit('USERLOGOUT');
//     }
//   },
// };
// const mutations = {
//   GETCODE(state, code) {
//     state.code = code;
//   },
//   USERLOGIN(state, token) {
//     state.token = token;
//   },
//   GETUSERINFO(state, userInfo) {
//     state.userInfo = userInfo;
//   },
//   //退出登录情况全部用户信息
//   USERLOGOUT(state) {
//     state.token = '';
//     state.userInfo = {};
//     //本地存储数据【token】
//     clearToken();
//   },
// };
// const state = {
//   code: '',
//   token: getToken(),
//   userInfo: {},
// };
// const getters = {};

// export default {
//   actions,
//   mutations,
//   state,
//   getters,
// };
