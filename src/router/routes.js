export default [
  // 重定向
  {
    path: '/',
    redirect: '/layout',
  },
  {
    path: '/login',
    component: () => import('@/views/Login'),
  },
  {
    path: '/layout',
    component: () => import('@/views/layout'),
    meta: { isShow: true ,title: 'leapting'},
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('@/views/home'),
        meta: { isShow: true ,title: '首页'},
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('@/views/users'),
        meta: { isShow: true ,title: '用户'},
      },
      // 机器人管理
      {
        path: '/robotsInfo',
        name: 'robotsInfo',
        component: () => import('@/views/robots/robotsInfo'),
        meta: { isShow: true ,title: '机器人信息'},
      },
      {
        path: '/diagnostics',
        name: 'diagnostics',
        component: () => import('@/views/robots/diagnostics'),
        meta: { isShow: true ,title: '机器人诊断'},
      },
      {
        path: '/behaviorInfo',
        name: 'behaviorInfo',
        component: () => import('@/views/robots/behaviorInfo'),
        meta: { isShow: true ,title: '行为信息'},
      },
      {
        path: '/gitOprate',
        name: 'gitOprate',
        component: () => import('@/views/robots/gitOprate'),
        meta: { isShow: true ,title: 'Git操作'},
      },
      // 参数配置
      {
        path: '/ros_paramcfg',
        name: 'ros_paramcfg',
        component: () => import('@/views/configure/ros_paramcfg'),
        meta: { isShow: true ,title: 'ROS参数配置'},
      },
      {
        path: '/map',
        name: 'map',
        component: () => import('@/views/home/maps'),
        meta: { isShow: true ,title: '地图'},
      },
      {
        path: '/three',
        name: 'three',
        component: () => import('@/views/three/index'),
        meta: { isShow: true ,title: 'three'},
      }
    ]
  },
  // {
  //   path: '/search/:keyword?',
  //   component: () => import('@/pages/Search'),
  //   name: 'search',
  //   meta: { isShow: true, title: '搜索' },
  // },
  
];
