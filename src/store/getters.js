const getters = {
  // token: state => state.user.token,
  // baseRoute: state => state.permission.routes,
  // userInfo: state => state.user.accountInfo
  wifi: state => state.Device.SYSTEM.underling.NET.underling.wifi.message
};
export default getters;
