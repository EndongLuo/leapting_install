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
    connected:'Connected',
    notconnect:'Not Connected',
    battery: 'Battery',
    network:'Network',
    speed:'Speed'
  },
  map:{
    selectmap:'Select Map',
  },
  task:{
    taskinfo:'Task Info',
    task:'Task',
    step:'Status',
    none: 'None'
  },
  install:{
    control:'Chassis Control',
    fai: 'Fully-Auto',
    sai: 'Semi-Auto',
    monitor:'Monitor',
    model:'3D Model',
    start:'Start',
    pause:'Pause',
    continue:'Continue',
    stop:'Stop'
  },
  connPrompt:{
    success:'Connected to Install Robot.',
    close:'Connection to Install Robot closed.'
  },
  prompt:{
    switchMode: 'Task in progress, please end the task before switching modes.',
    inputErrorMessage: 'Incorrect format',
    inputNum:'Please enter the number of installed components',
    prompt:'Prompt'
  }
}

export default en;