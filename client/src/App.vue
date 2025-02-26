<template>
  <div id="app">
    <router-view />

    <!-- 弹框 -->
    <el-dialog :visible.sync="dialogs.dialog" width="60%" :title="$t('prompt.prompt')" center :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-weight: 600;font-size: 24px;">{{ $t(`dialog.${dialogs.text}`) }}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-for="b, i in dialogs.btns" :key="i" @click="dialogfn(b)">{{ $t(`dialogs.${b}`) }}</el-button>
        <el-button type="primary" @click="dialogfn('confirm')">{{ $t(`mains.confirm`) }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import layout from "./views/layout";
import { mapState } from 'vuex';
export default {
  name: "App",
  components: {
    layout,
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapState('socket', ['rosConnect', 'dialogs']),
  },
  mounted() {
    this.$store.dispatch('socket/init');
  },
  watch: {
  },
  methods: {
    dialogfn(val) {
      this.$store.dispatch('socket/sendDialog', val);
    },
  },
};
</script>
