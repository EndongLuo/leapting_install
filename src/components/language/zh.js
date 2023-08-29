import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

const zh = {
  language: {
      name: 'English'
  },
  ...zhLocale,
  user: {
      login:'登录',
      register:'注册',
      loginUsername:'请输入邮箱/手机号',
  },
  mains:{
    confirm:'确认',
    cancel:'取消',
    edit:'编辑',
    goback:'返回',
    save: '保存'
  },
  nav:{
    index: '首页',
    flexbe:'任务',
    diagnostic:'诊断',
    config:'配置',
    map:'地图'
  },
  table:{
    send: '发送',
    stop: '停止',
  },
  diagnostics:{
    complete: '完成',
    warning:'警告',
    error:'错误',
    stale:'失效',
    total: '全部'
  },
  robot:{
    robotinfo:'机器人信息',
    robotid: '机器人ID',
    connect:'连接',
    connected:'已连接',
    notconnect:'未连接',
    battery: '电池',
    network:'网络',
    angular:'角速度',
    linear:'线速度'
  },
  map:{
    selectmap:'选择地图',
  },
  task:{
    taskinfo:'任务信息',
    task:'任务',
    step:'步骤',
    none: '暂无'
  },
  install:{
    control:'机器人操控',
    fai: '全自动安装',
    sai: '半自动安装',
    monitor:'监控',
    model:'3D模型',
    pause:'暂停',
    start: '开始',
    continue:'继续',
    stop:'停止'
  },
  connPrompt:{
    success:'安装机器人已连接。',
    close:'安装机器人连接已关闭'
  },
  prompt:{
    switchMode: '任务进行中，请先结束任务再切换模式。',
    inputErrorMessage: '格式不正确',
    inputNum:'请输入安装组件数量',
    prompt:'提示'
  }
}

export default zh;