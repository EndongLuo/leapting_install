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
        meta: { isShow: true ,title: 'Index'},
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('@/views/users'),
        meta: { isShow: true ,title: 'Users'},
      },
      // 机器人管理
      {
        path: '/robotsInfo',
        name: 'robotsInfo',
        component: () => import('@/views/robots/robotsInfo'),
        meta: { isShow: true ,title: 'robotInfo'},
      },
      {
        path: '/diagnostics',
        name: 'diagnostics',
        component: () => import('@/views/robots/diagnostics'),
        meta: { isShow: true ,title: 'Diagnostic'},
      },
      {
        path: '/behaviorInfo',
        name: 'behaviorInfo',
        component: () => import('@/views/robots/behaviorInfo'),
        meta: { isShow: true ,title: 'Task'},
      },
      {
        path: '/gitOprate',
        name: 'gitOprate',
        component: () => import('@/views/robots/gitOprate'),
        meta: { isShow: true ,title: 'Git'},
      },
      // 参数配置
      {
        path: '/ros_paramcfg',
        name: 'ros_paramcfg',
        component: () => import('@/views/configure/ros_paramcfg'),
        meta: { isShow: true ,title: 'ROS Config'},
      },
      {
        path: '/map',
        name: 'map',
        component: () => import('@/views/home/maps'),
        meta: { isShow: true ,title: 'Map'},
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
