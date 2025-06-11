<template>
  <div>
    
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
export default {
  data() {
    return {
       
    };
  },
  computed: {
    ...mapState("ros", [
      "diagnostics",
      "elTabPane",
      "Device",
      "classifyDiagnostics",
    ]),
    ...mapGetters("ros", ["getTabPane", "getClassify"]),
  },
  mounted() {
    window.onresize = () => {
      this.tableHeight = window.innerHeight - 160;
    };
    this.handleClick();
    // this.getDiag();
  },
  methods: {
    handleClick() {
      this.getClassify(this.activeName);
    },
    // digui(Obj, newArray = []) {
    //   for (const key in Obj) {
    //     if (Object.hasOwnProperty.call(Obj, key)) {
    //       const value = Obj[key];
    //       newArray.push(value);
    //       if (typeof value === "object" && value.underling) {
    //         const underling = this.digui(value.underling);
    //         value.underling = underling;
    //       }
    //     }
    //   }
    //   return newArray;
    // },
    // getDiag() {
    //   console.log(this.Device);
    //   var diag = JSON.parse(this.diag);
    //   console.log(diag);
    //   var str = diag.SYSTEM.underling.NET.underling.wifi.message;
    //   console.log(str);
    //   let obj = {};

    //   // 使用正则表达式将字符串按逗号和空格分割成多个键值对
    //   str.split(/,\s+/).forEach(pair => {
    //   // 使用正则表达式将键和值分离
    //   let [key, value] = pair.split(/:\s*/);
    //   // 将键值对添加到对象中
    //   obj[key] = value;
    //   });
    //   console.log(obj)

    //   var diag1 = this.digui(diag);
    //   console.log("diag1", diag1);
    // },
  },
};
</script>

<style scoped>
.el-table .cell {
  line-height: 0px;
}
.success {
  color: #67c23a;
}
.warning {
  color: #e6a23c;
}
.error {
  color: #f56c6c;
}
.question {
  color: #409eff;
}
</style>
