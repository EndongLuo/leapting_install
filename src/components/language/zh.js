import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

const zh = {
  language: {
      name: 'English'
  },
  ...zhLocale,
  mains:{
    confirm:'确认',
    cancel:'取消',
    edit:'编辑',
    goback:'返回',
    save: '保存'
  },
  nav:{
    index: '首页',
    task:'任务',
    diagnostic:'诊断',
    config:'配置',
    map:'地图'
  },
  table:{
    send: '发送',
    stop: '停止',
    delete: '删除',
    edit:'编辑'
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
    reconnect:'重连',
    connected:'已连接',
    notconnect:'未连接',
    battery: '电池',
    network:'网络',
    speed:'速度'
  },
  map:{
    selectmap:'选择地图',
    nomap:'暂无地图'
  },
  task:{
    taskinfo:'任务信息',
    task:'任务',
    step:'步骤',
    none: '暂无'
  },
  install:{
    control:'机器人操控',
    armcontrol:'机械臂操控',
    fai: '全自动安装',
    sai: '半自动安装',
    monitor:'监控',
    model:'3D模型',
    pause:'暂停',
    start: '开始',
    continue:'继续',
    stop:'停止',
    withdraw:'撤回',
    reset:'复位',
    check:'检测',
  },
  config:{
    pducontrol:'PDU 控制',
    chargeStatus:'充电状态',
    chassis:'底盘上电',
    inverter:'逆变器上电',
    charge:'充电上电',
    basecontrol:'基础控制',
    avoidance:'避障',
    reminder:'电量提醒',
    pvmsize:'组件尺寸',
    installgap:'安装间隙',
    devicestatus:'设备状态',
    handeye:'手眼标定',
    autohandeye:'自动标定',
    noautohandeye:'手动标定'
  },
  connPrompt:{
    success:'安装机器人已连接。',
    close:'安装机器人连接已关闭',
    reconn:'重新连接'
  },
  prompt:{
    switchMode: '任务进行中，请先结束任务再切换模式。',
    inputErrorMessage: '格式不正确',
    inputNum:'请输入安装组件数量',
    uninputNum:'请输入拆卸组件数量',
    prompt:'提示',
    lowBattery: '电量过低'
  },
  identify:{
    identifyOk:'识别成功。',
    identifyFail:'识别失败。',
    identifyPick:'请检查是否有组件或者组件是否反光。',
    identifyPut:'请移动车辆：桩子与车内侧履带2m平行（误差±5cm）。',
    UI_dump:'是否释放吸盘',
    UI_place:'是否放下光伏组件到支架上',
    putting:'放回中。。。',
    identifyagain:'继续识别',
    checkPickupTF:'抓取识别中。。。',
    checkPlaceTF:'放置识别中。。。',
    checkTF:'检测识别中。。。',
    close:'确认关闭？',
    taskover:'任务结束！',
    UI_handeye_arm:'移动机械臂',
    UI_handeye_take:'采集数据',
  }
}

export default zh;