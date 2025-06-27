<template>
  <div style="overflow-y: auto; height: 100%;">
    <el-button>显示选中节点的label</el-button>
    <el-tree
        :data="treeData"
        :props="defaultProps"
        :default-expanded-keys="expandedKeys"
        :expand-on-click-node="false"
        @node-expand="handleNodeExpand"
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
        label: 'name'
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
    saveExpandedNodes() {
      this.expandedKeys = this.$refs.tree.getCurrentExpandedKeys();
    },
    
    restoreExpandedNodes() {
      this.$nextTick(() => {
        this.expandedKeys.forEach(key => {
          this.$refs.tree.setExpanded(key, true);
        });
      });
    },
    
    async refreshTreeData() {
      this.saveExpandedNodes();
      const newData = await this.fetchTreeData();
      this.treeData = buildTreeForElTree(newData);
      this.restoreExpandedNodes();
    },
    
    async fetchTreeData() {
      // 这里替换为你的实际数据获取逻辑
      return [...data]; // 使用你的原始数据或从API获取
    },
    
    handleNodeExpand(data) {
      if (!this.expandedKeys.includes(data.id)) {
        this.expandedKeys.push(data.id);
      }
    },
    
    handleNodeCollapse(data) {
      const index = this.expandedKeys.indexOf(data.id);
      if (index > -1) {
        this.expandedKeys.splice(index, 1);
      }
    }
  },
  watch: {
    diagnosticsAgg(val){
      this.treeData = val;
      this.$nextTick(() => {
        this.expandedKeys.forEach(key => {
          this.$refs.tree.setExpanded(key, true);
        });
      });
    }
  }

}
</script>

<style>
/* 保持原来的样式 */
</style>