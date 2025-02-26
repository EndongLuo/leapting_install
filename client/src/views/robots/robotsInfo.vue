<template>
  <div>
    <L_table 
    :tableData="tableData" 
    :column="column"
    />

  </div>
</template>

<script>
import L_table from "@/components/L_table";
import classifyDiagnostic from "@/components/deviceDiagnostic/classifyDiagnostic";
import { getRobot } from "@/api";
export default {
  components: { L_table, classifyDiagnostic, },
  data() {
    return {
      tableData: [],
      column:[
        {
          id:'005',
          prop:'status',
          label:'状态'
        },
        {
          id:'001',
          prop:'uid',
          label:'uid'
        },
        {
          id:'002',
          prop:'username',
          label:'名称'
        },
        {
          id:'003',
          prop:'phone',
          label:'手机号码'
        }
      ]
    };
  },
  mounted() {
    // this.getTableData();
  },
  methods: {
    async getTableData() {
      // let res = await reqTableData();
      // this.tableData = res.data.data;
      // console.log(res.data.data);
    },
  },
};
</script>

<style scoped>
</style>
