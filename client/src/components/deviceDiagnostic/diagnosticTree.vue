<template>
  <div style="overflow-y: auto; height: 100%;">
    <el-button>显示选中节点的label</el-button>
    <el-tree
        :data="diagnosticsAgg"
        :props="defaultProps"
        node-key="id"
        show-checkbox
        :default-expand-all="false"
        :expand-on-click-node="false"
        :default-expanded-keys="expandedKeys"
        @node-click="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
    ></el-tree>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  data() {
    return {
      treeData: [],
      expandedKeys: [], // 存储展开的节点key
      checkedKeys: [], // 存储选中的节点key
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 模拟数据ID生成器
      dataIdCounter: 0
    }
  },
  computed: {
    ...mapState("socket", [ 'diagnosticsAgg' ]),
  },

  created() {
    
  },
  beforeDestroy() {
    this.stopAutoRefresh();
  },
  methods: {
    // 树节点展开
    handleNodeExpand(data) {
      // 保存当前展开的节点
      let flag = false
      this.expandedKeys.some(item => {
        if (item === data.name) { // 判断当前节点是否存在， 存在不做处理
          flag = true
          return true
        }
      })
      if (!flag) { // 不存在则存到数组里
        this.defaultExpandIds.push(data.name)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.$nextTick(() => {
        this.expandedKeys.some((item, i) => {
          if (item === data.name) {
            this.expandedKeys.splice(i, 1)
          }
        })
      })
    }
  }, 
  watch: {
    diagnosticsAgg(val){
        
    }
  }

}
</script>

<style>
/* 保持原来的样式 */
</style>