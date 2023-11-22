import enLocale from 'element-ui/lib/locale/lang/en';

const en = {
  language: {
      name: '中文'
  },
  ...enLocale,
  mains:{
    confirm:'Confirm',
    cancel:'Cancel',
    edit:'Edit',
    goback:'Go Back',
    save: 'Save'
  },
  nav:{
    index: 'Index',
    task:'Task',
    diagnostic:'Diagnosis',
    config:'Config',
    map:'Map'
  },
  table:{
    send: 'Start',
    stop: 'Stop',
    delete: 'Delete',
    edit:'Edit'
  },
  diagnostics:{
    complete: 'Complete',
    warning:'Warning',
    error:'Error',
    stale:'Stale',
    total: 'Total'
  },
  robot:{
    robotinfo:'Robot Info',
    robotid: 'Robot ID',
    connect:'Connect',
    reconnect:'Reconnect',
    connected:'Connected',
    notconnect:'Not Connected',
    battery: 'Battery',
    network:'Network',
    speed:'Speed'
  },
  map:{
    selectmap:'Select Map',
    nomap:'No Map'
  },
  task:{
    taskinfo:'Task Info',
    task:'Task',
    step:'Status',
    none: 'None'
  },
  install:{
    control:'Chassis Control',
    armcontrol:'Arm Control',
    fai: 'Fully-Auto',
    sai: 'Semi-Auto',
    monitor:'Monitor',
    model:'3D Model',
    start:'Start',
    pause:'Pause',
    continue:'Continue',
    stop:'Stop',
    withdraw:'Withdraw',
    reset:'Reset',
    check:'Check',
  },
  config:{
    pducontrol:'PDU Control',
    chargeStatus:'Charge Status',
    chassis:'Chassis On',
    inverter:'Inverter On',
    charge:'Charge On',
    basecontrol:'Base Control',
    avoidance:'Avoidance',
    reminder:'Power Reminder',
    pvmsize:'PVM Size',
    installgap:'Install Gap',
    devicestatus:'Device Status'
  },
  connPrompt:{
    success:'Connected to Install Robot.',
    close:'Connection to Install Robot closed.',
    reconn:'Reconnect'
  },
  prompt:{
    switchMode: 'Task in progress, please end the task before switching modes.',
    inputErrorMessage: 'Incorrect format',
    inputNum:'Please enter the number of PVM installations',
    uninputNum:'Please enter the number of PVM disassembled',
    prompt:'Prompt',
    lowBattery:'Battery too low'
  },
  identify:{
    identifyOk:'Successfully Identified.',
    identifyFail:'Failed Identified.',
    identifyPick:'Please check if there are any PVM or if the PVM reflect light.',
    identifyPut:'Please move the vehicle: the stake is 2m parallel to the inner track of the vehicle (with an error of ± 5cm).',
    UI_dump:'Whether to release the suction cup',
    UI_place:'Is the photovoltaic module placed on the bracket',
    putting:'Put it back in...',
    identifyagain:'Continue to identify',
    checkPickupTF:'Grab recognition in progress...',
    checkPlaceTF:'Placing recognition...',
    checkTF:'Detecting and recognizing...',
    close:'Confirm closing?',
    taskover:'The task is over!'
  }
}

export default en;