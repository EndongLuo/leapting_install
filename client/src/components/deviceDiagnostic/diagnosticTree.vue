<template>
  <div>
    <el-select v-model="bootsNumber" placeholder="请选择开机次数" @change="selectChange">
      <el-option
        v-for="item in bootsNumberList"
        :key="item.num"
        :label="item.num"
        :value="item.num">
      </el-option>
    </el-select>
    <el-time-picker v-if="bootsNumber"
      is-range
      arrow-control
      v-model="createTime"
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      placeholder="选择时间范围"
      @change="timeChange">
    </el-time-picker>
    <el-tree
        ref="tree"
        :data="treeData"
        :props="defaultProps"
        node-key="fullPath"
        show-checkbox
        :check-strictly="true"
        :default-expanded-keys="defaultExpandedKeys"
        :default-checked-keys="defaultCheckedKeys"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        @check="currentChecked"
    ></el-tree>
    <div ref="chart" style="width: 900px; height: 400px;" class="chart-container"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { getBootsNumList, getMessages } from '@/api';
import * as echarts from 'echarts';
export default {
  data() {
    return {
      treeData: [],
      defaultExpandedKeys: [], // 存储展开的节点key
      defaultCheckedKeys: [],
      expandedKeys: [],
      checkedKeys: [], // 存储选中的节点key
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      bootsNumber: null,
      bootsNumberList: [],
      createTime: [new Date(2016, 9, 10, 8, 40), new Date(2016, 9, 10, 9, 40)],
      selectdTime: [],
      chart: null,
      ddata: [],
    }
  },
  computed: {
    ...mapState("socket", [ 'diagnosticsAgg' ]),
  },

  created() {
    this.getBootsNumber();
  },
  methods: {

    // 获取开机次数数组
    async getBootsNumber(){
      const res = await getBootsNumList();
      if(res.code == 200){
        this.bootsNumberList = res.data;
      }
    },

    // 下拉框选择事件
    selectChange(val){
      this.bootsNumberList.filter((item) => {
        if(item.num == this.bootsNumber) {
          this.createTime = [new Date(item.minTime), new Date(item.maxTime)];
          return;
        }
      })
    },
    
    // 事件选择事件
    async timeChange(data) {
      this.selectdTime = data;
      var res = await getMessages({bootsNumber: this.bootsNumber, selectdTime: this.selectdTime});
      this.ddata = res.data;
      this.initChart();
    },

    // 树节点展开
    handleNodeExpand(data) {
      // 保存当前展开的节点
      let flag = false
      this.expandedKeys.some(item => {
        if (item === data.fullPath) { // 判断当前节点是否存在， 存在不做处理
          flag = true
          return true
        }
      })
      if (!flag) { // 不存在则存到数组里
        this.expandedKeys.push(data.fullPath)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.expandedKeys.some((item, i) => {
        if (item === data.fullPath) {
          this.expandedKeys.splice(i, 1)
        }
      })
    },

    // 选中事件
    currentChecked (nodeObj, SelectedObj) {
      console.log(SelectedObj.checkedKeys)   // 这是选中的节点的key数组
      // console.log(SelectedObj.checkedNodes)  // 这是选中的节点数组 
      this.checkedKeys = SelectedObj.checkedKeys;
    },

    // 初始化echart
    initChart() {
      this.chart = echarts.init(this.$refs.chart);
      
      // 处理数据
      const categories = new Set();
      const seriesMap = {};
      const timeData = [];
      
      // 解析数据并组织格式
      this.ddata.forEach(item => {
          try {
              const msgObj = JSON.parse(item.message);
              const timestamp = new Date(item.create_time).getTime();
              
              // 收集时间点
              timeData.push(timestamp);
              
              // 收集所有键名作为类别
              Object.keys(msgObj).forEach(key => {
                if(this.checkedKeys.includes(key)){
                  categories.add(key);
                  
                  if (!seriesMap[key]) {
                      seriesMap[key] = [];
                  }
                  
                  // 添加数据点 [时间戳, 值]
                  seriesMap[key].push([timestamp, msgObj[key]]);
                }
              });
              
          } catch (e) {
              console.error('解析错误:', e);
          }
      });
      
      // 构建系列数据
      const series = Array.from(categories).map(category => ({
          name: category,
          type: 'line',
          showSymbol: false,
          symbolSize: 8,
          data: seriesMap[category],
          lineStyle: {
              width: 3
          }
      }));
      
      // 配置图表选项
      const option = {
          title: {
              text: '状态变化时间轴',
              left: 'center'
          },
          tooltip: {
              trigger: 'axis',
              formatter: function(params) {
                  const date = new Date(params[0].value[0]);
                  const timeStr = date.toLocaleString();
                  let result = `<div>${timeStr}</div>`;
                  
                  params.forEach(param => {
                      result += `<div style="margin-top:5px;">
                          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};"></span>
                          ${param.seriesName}: <b>${param.value[1]}</b>
                      </div>`;
                  });
                  
                  return result;
              }
          },
          legend: {
              data: Array.from(categories),
              bottom: 10
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '15%',
              top: '15%',
              containLabel: true
          },
          xAxis: {
              type: 'time',
              axisLabel: {
                  formatter: function(value) {
                      const date = new Date(value);
                      return echarts.time.format(date, '{MM}/{dd} {HH}:{mm}:{ss}', false);
                  }
              },
              name: '时间',
              nameLocation: 'middle',
              nameGap: 30
          },
          yAxis: {
              type: 'value',
              min: 0,
              max: 4,
              interval: 1,
              name: '状态',
              nameLocation: 'middle',
              nameGap: 40
          },
          dataZoom: [{
              type: 'inside',
              start: 0,
              end: 100
          }, {
              type: 'slider',
              height: 20,
              bottom: 40,
              start: 0,
              end: 100
          }],
          series: series
      };
      
      this.chart.setOption(option);
      
      // 响应窗口大小变化
      window.addEventListener('resize', () => this.chart.resize());
  }
  },
  watch: {
    diagnosticsAgg(val){
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      this.treeData = val;
      this.$nextTick(() => { 
        this.defaultExpandedKeys = this.expandedKeys;
        this.defaultCheckedKeys = checkedKeys;
      });
    }
  }

}
</script>

<style>
/* 保持原来的样式 */
</style>