<template>
  <div>
    <div class="tacks"  @click="taskDialogVisible = true">
      <span><b>{{$t('task.task')}}：</b>{{ taskArr[1] }}</span>
      <span><b>{{$t('task.step')}}：</b>{{ taskArr[0] }}</span>
    </div>

    <!-- 机器人弹框 -->
    <el-dialog
        :title="$t('task.taskinfo')"
        :visible.sync="taskDialogVisible"
        width="80%"
        center
      >
        <div style="height: 280px; overflow-y: scroll; ">
          <div class="tasklist" style="font-weight: 700; margin: 10px 100px 10px 70px"> 
          <span>{{$t('task.task')}}</span><span>{{$t('task.step')}}</span> <span>Time</span></div>
          <div class="tasklist" v-for="l in list">
          <!-- <div v-for="l in list"> -->
            <!-- <div v-for=" l1 in l"> {{ l1 }} </div> -->
            <span class="li-in">{{ l[1] }}</span>
            <span class="li-in1">{{ l[0] }}</span>
            <span class="li-in">{{ l[2] }}</span>
          </div>
          
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="taskDialogVisible = false">{{$t('mains.cancel')}}</el-button>
          <el-button type="primary" @click="taskDialogVisible = false">
            {{$t('mains.confirm')}}
          </el-button>
        </span>
      </el-dialog>
  </div>
  
</template>

<script>
import { mapState } from 'vuex';
import {date} from '@/utils/date'
export default {
  name: "Tacks",
  data(){
    return{
      timer:null,
      taskArr:['None','None'],
      taskDialogVisible:false,
      list:[]
    }
  },
  created() {
    this.timer = setInterval(()=>{
      this.tasking();
      this.taskList()
    }, 1000);
  },
  computed: {
    ...mapState('ros', ['ros']),
  },
  mounted(){
    var ls= localStorage.getItem('taskList')
    this.list =JSON.parse(ls) || [];
    // console.log(this.list);
  },
  beforeDestroy() {
    localStorage.setItem('taskList',JSON.stringify(this.list));
    if (this.timer) clearInterval(this.timer);
  },
  methods:{
    tasking(){
      var taskState = this.$store.state.ros.taskState
      if (typeof taskState == 'undefined') return;
      if (taskState == ':') this.taskArr = ['None','None'];
      // else this.taskArr = taskState.replace(":InstallPVM","").split("/");
      else this.taskArr = taskState.split(":");
      // console.log(this.taskArr);
    },
    taskList(){
      if(!this.list.length){
        this.list.unshift([...this.taskArr, date()]);
      } 
      else {
        if (this.taskArr[0]==this.list[0][0]) this.list[0]=[...this.taskArr, date()];
        else this.list.unshift([...this.taskArr, date()]);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.tasklist{
  display: flex; justify-content: space-between; margin: 5px 50px
}
.li-in{
  display: inline-block;
  width: 150px;
  // margin-right: 50px;
}
.li-in1{
  width: 320px;
}
.tacks {
  display: flex;
  justify-content: space-around;
  font-size: 14px;
  margin: 5px 0;
  span {
    padding:0 7px;
    // width: 300px;
    height: 22px;
    overflow: hidden;
    border-radius: 5px;
    border: 1px solid #dbdbdb;
    
  }

}
</style>
