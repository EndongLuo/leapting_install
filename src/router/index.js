import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';

Vue.use(VueRouter);

//备份VueRouter.prototype原有的push|replace方法
let originPush = VueRouter.prototype.push;
let originReplace = VueRouter.prototype.replace;
//重写VueRouter.prototype的push方法
VueRouter.prototype.push = function (location, resolve, reject) {
  //原始的push方法可以进行路由跳转，但是需要保证上下文this是VueRouter类的实例
  //第一种情况：外部在使用push的时候传递成功与失败的回调
  if (resolve && reject) {
    originPush.call(this, location, resolve, reject);
  } else {
    //第二种情况：外部在使用push方法的时候没有传递成功与失败的回调函数
    originPush.call(
      this,
      location,
      () => {},
      () => {},
    );
  }
};
//重写VueRouter.prototype.replace方法
VueRouter.prototype.replace = function (location, resolve, reject) {
  resolve && reject
    ? originReplace.call(this, location, resolve, reject)
    : originReplace.call(
        this,
        location,
        () => {},
        () => {},
      );
};

let router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { y: 0 };
  },
});

// 全局前置路由守卫
router.beforeEach(async (to, from, next) => {
    next()
  
});

//全局后置路由守卫————初始化的时候被调用、每次路由切换之后被调用
router.afterEach((to, from) => {
  document.title = to.meta.title || 'Leapting';
});

export default router;
