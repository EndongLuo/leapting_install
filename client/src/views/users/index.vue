<template>
  <div class="test">
    <L_table 
    :tableData="tableData" 
    :column="column"
    />
  </div>
</template>

<script>
import L_table from "@/components/L_table";
// import { reqTableData } from "@/api";
export default {
  name: "test",
  components: { L_table },
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
        },
        {
          id:'004',
          prop:'role',
          label:'角色'
        },
       
      ]
    };
  },
  mounted() {
    // this.getTableData();
  },
  methods: {
    async getTableData() {
      let res = await reqTableData();
      this.tableData = res.data.data;
      // console.log(res.data.data);
    },
  },
};
</script>

<style scoped>
/* .test {
  font-size: 0.5rem;
} */
</style>
