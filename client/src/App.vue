<template>
  <div id="app">
    <router-view />

    <!-- 弹框 -->
    <el-dialog :visible.sync="dialogs.dialog" width="60%" :title="$t('prompt.prompt')" center :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-size: 24px;">{{ $t(`dialog.${dialogs.text}`) }} <span style="font-weight: 600;"
            v-if="dialogs.seq">{{ dialogs.seq }}mm</span></span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-for="b, i in dialogs.btns" :key="i" @click="diaglogResponse(b)">{{ $t(`dialog.${b}`) }}</el-button>
        <el-button type="primary" @click="dialogfn('confirm')">{{ $t(`mains.confirm`) }}</el-button>
      </span>
    </el-dialog>

    <!-- 诊断日志请求 -->
    <el-dialog :visible.sync="diaglogRequest.dialog" width="60%" :title="$t('prompt.prompt')" center
      :append-to-body='true'>
      <div style="display: flex; justify-content: center; align-items: center;flex-direction: column;">
        <span style="font-size: 24px;" v-if="lang == 'zh'">{{ diaglogRequest.cn }} </span>
        <span style="font-size: 24px;" v-else>{{ diaglogRequest.en }} </span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-for="b, i in diaglogRequest.btns" :key="i" @click="diaglogResponse(b.en)">{{ lang == 'zh' ? b.cn : b.en
          }}</el-button>
        <!-- <el-button type="primary" @click="dialogfn('confirm')">{{ $t(`mains.confirm`) }}</el-button> -->
        <!-- {{ $t(`dialog.${b}`) }} -->
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
      lang: localStorage.getItem('languageSet') || 'zh',
    };
  },
  computed: {
    ...mapState('socket', ['rosConnect', 'dialogs', 'diaglogRequest']),
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
    diaglogResponse(val) {
      this.$store.dispatch('socket/diaglogResponse', val);
    },
  },
};
</script>
