// src/mixin/index.js
import { mapState } from 'vuex';
export const mixins = {
  data() {
    return {
      goon:0,
      isShow: 0,
      isInstall: 0,
      isVideo: 0,
      isThree: 0,
      flexbeSwitch: true,
      pvm_num: 50,
      goal: null,
    };
  },
  computed: {
    ...mapState('ros',['ros']),
  },
  created() {},
  mounted() {
    this.start
  },
  methods: {
    // 开始第一次
    start(id) {
      // 暂停继续
      if(this.goon){this.Pause();return;} 
      this.flexbeSwitch = false;
      this.isInstall = id;
      if (this.isInstall) this.$message(this.$t('prompt.switchMode'));
      else if (id == 1) {
        this.isShow = id;
        this.isInstall = id;
        var auto = id == 1 ? false : true;
        this.$message.success('Start Installation.');
        this.sendGoal(auto, 50);
      }
      else {
        this.$prompt(this.$t('prompt.inputNum'), this.$t('prompt.prompt'), {
          confirmButtonText: this.$t('mains.confirm'),
          cancelButtonText: this.$t('mains.cancel'),
          inputPattern: /[1-9]{1}\d{0,3}/,
          inputErrorMessage: this.$t('prompt.inputErrorMessage')
        }).then(({ value }) => {
          this.isShow = id;
          this.isInstall = id;
          var auto = id == 1 ? false : true;

          this.$message.success('success: ' + value);

          // this.pvm_num = value;
          console.log(Number(value));
          this.sendGoal(auto, value);
        }).catch(() => {
          this.isInstall = 0;
          this.flexbeSwitch =true;
          this.isShow = 0;
          this.$message(this.$t('mains.cancel'));
        });
      }
    },

    // 发送goal
    sendGoal(auto, pvm_num) {

      var ls = localStorage.getItem('pvm_param')
      const { pvm } = JSON.parse(ls);

      var goalMsg = new ROSLIB.Message({
        behavior_name: 'CommInstallPVM',
        arg_keys: ['auto', 'pvm_num', 'pvm_width', 'install_gap'],
        arg_values: [`${auto}`, `${pvm_num}`, pvm.pvm_width, pvm.install_gap]
      });
      // console.log(goalMsg);

      var actionClient = new ROSLIB.ActionClient({
        ros: this.ros,
        actionName: 'flexbe_msgs/BehaviorExecutionAction',
        serverName: '/flexbe/execute_behavior'
      });
      this.goal = new ROSLIB.Goal({
        actionClient: actionClient,
        goalMessage: goalMsg
      });

      // this.goal.send();

      this.goal.on('feedback', (feedback) => {
        this.$message(`feedback: ${JSON.stringify(feedback)}`);
        console.log('Feedback: ', feedback);
      });

      this.goal.on('result', (result) => {
        this.$message(`result: ${JSON.stringify(result)}`);
        console.log('Final Result: ', result);
      });
    },


    // 任务暂停
    Pause(){
      this.goon=1;
      var pause_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/flexbe/command/pause',
        messageType: 'std_msgs/Bool'
      });

      if (this.flexbeSwitch) {
        this.$message.success('Go on.');
        this.flexbeSwitch = false;
      }
      else {
        this.$message('Pause');
        this.flexbeSwitch = true;
      }

      console.log(this.flexbeSwitch);
      pause_sub.publish({ "data": this.flexbeSwitch });
    },
  },

  // 任务停止
  Stop() {
    var stop_sub = new ROSLIB.Topic({
      ros: this.ros,
      name: '/flexbe/command/preempt',
      messageType: 'std_msgs/Empty'
    });
    stop_sub.publish({});
    this.$message.success('Installation Stopped.');
    this.isInstall = 0;
    this.flexbeSwitch =true;
    this.isVideo = 0;
    this.isThree = 0;
    this.isShow = 0;
    this.goon = 0;
  },
};