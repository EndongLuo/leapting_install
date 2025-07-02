<template>
    <div>
        <el-container>
            <el-aside width="200px">
                <el-tree style="width:450px; overflow-x: auto;"
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
            </el-aside>
            
            <el-container>
                <el-header>
                    <el-select v-model="bootsNumber" placeholder="请选择开机次数" @change="selectChange" style="width: 150px;">
                    <el-option
                        v-for="item in bootsNumberList"
                        :key="item.num"
                        :label="item.num"
                        :value="item.num">
                    </el-option>
                    </el-select>
                    <!-- :picker-options="{
                        selectableRange: createTime
                    }" -->
                    <el-time-picker style="width: 200px;" v-if="bootsNumber"
                    is-range
                    arrow-control
                    v-model="createTime"
                    range-separator="-"
                    placeholder="选择时间范围"
                    @change="timeChange">
                    </el-time-picker>
                    <el-button type="primary" plain icon="el-icon-search" @click="searchClick">查询</el-button>
                    <span><el-tag type="success">诊断历史数据信息</el-tag></span>
                </el-header>
                
                <el-main class="chart-main" style="height: 100%; width: 100%;">
                    <div ref="chart" class="chart" style="height: 100%; width: 100%;"></div>
                </el-main>
            </el-container>
        </el-container>
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
      createTime: [],
      selectdTime: [],
      chart: null,
      categories: null,
      resultData: [],
    }
  },
  computed: {
    ...mapState("socket", [ 'diagnosticsAgg' ]),
  },
  created() {
    this.getBootsNumber();
  },
  methods: {
    // 查询事件
    async searchClick(){
        console.log(this.createTime);
        
        if(this.checkedKeys.length == 0){
            this.$message.success('未选择展示数据');
        } else if(this.bootsNumber == null){
            this.$message.success('未选择开机次数');
        } else if(this.createTime.length == 0){
            this.$message.success('未选择时间段');
        } else{
            var res = await getMessages({bootsNumber: this.bootsNumber, selectdTime: this.selectdTime});
            this.resultData = res.data;
            this.initChart();
            this.drawChart();
        }
    },

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
      this.checkedKeys = SelectedObj.checkedKeys;
    },

    // 初始化echart
    initChart() {
        if(!this.chart){
            this.chart = echarts.init(this.$refs.chart);
            
            // 配置图表选项
            const option = {
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
                    data: this.categories
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
                            return echarts.time.format(value, '{HH}:{mm}:{ss}', false);
                        }
                    },
                    name: '时间',
                    nameLocation: 'middle',
                    nameGap: 30
                },
                yAxis: {
                    type: 'value'
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
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
                }]
            };
            this.chart.setOption(option);
            // 响应窗口大小变化
            window.addEventListener('resize', () => this.chart.resize());
        }
    },

    // 绘制图表
    drawChart(){
        // 处理数据
        this.categories = new Set();
        const showKey = new Set();
        const seriesMap = {};
        const timeData = [];
        // 解析数据并组织格式
        this.resultData.forEach(item => {
            try {
                const msgObj = JSON.parse(item.message);
                const timestamp = new Date(item.create_time).getTime();
                // 收集时间点
                timeData.push(timestamp);
                // 收集所有键名作为类别
                Object.keys(msgObj).forEach(key => {
                    if(this.checkedKeys.includes(key)){
                        showKey.add(key);
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
        this.categories = showKey;
        // 构建系列数据
        const series = Array.from(showKey).map(category => ({
            name: category,
            type: 'line',
            showSymbol: false,
            data: seriesMap[category],
            lineStyle: {
                width: 3
            }
        }));
        this.chart.setOption(
        { series },
        { replaceMerge: ['series'] }
      )
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
  },
  beforeDestroy() {
    window.removeEventListener('resize', () => this.chart && this.chart.dispose())
    this.chart && this.chart.dispose()
  }
}
</script>

<style lang="less" scoped>
    ::v-deep .el-container {
        height: calc(100vh - 80px);
        border: 1px solid #eee
    }

    .el-header {
        height: 40px !important;
        line-height: 40px !important;
        font-size: 14px;
        border-bottom: 1px solid #eee;
        span {
            font-size: 16px;
            position: absolute;
            right: 2px;
            top: 2px;
        }
    }
  
    .el-aside {
        color: #333;
        background-color: white;
    }
</style>