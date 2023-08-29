<template>
  <div @click="fullscreenChange" class="fullscreen">
    <i class="el-icon-full-screen"></i>
  </div>
</template>

<script>
export default {
    data() {
    return {
      isFullscreen: false // 管理全屏状态
    }
  },
  mounted() {
    // 快捷键判断
    window.onkeydown = (e) => {
      this.keyJudgment(e)
    }

    // 判断全屏状态
    this.isFullscreen = this.isFullScreens()
    window.onresize = () => {
      this.isFullscreen = this.isFullScreens()
    }
  },
  methods: {
    // 判断是否为全屏
    isFullScreens() {
      return (
        document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        false
      )
    },

    // F11快捷键判断
    keyJudgment(e) {
      const keyCode = e.keyCode || e.which || e.charCode
      const altKey = e.altKey
      const shiftKey = e.shiftKey
      const ctrlKey = e.ctrlKey
      if (!altKey && !ctrlKey && !shiftKey && keyCode === 122) {
        this.fullscreenChange()
        e.preventDefault()
        return
      }
    },

    // 全屏切换
    fullscreenChange() {
      console.log(1)
      this.isFullscreen = !this.isFullscreen
      const el = document.documentElement
      if (this.isFullscreen) {
        const rfs =
          el.requestFullScreen ||
          el.webkitRequestFullScreen ||
          el.mozRequestFullScreen ||
          el.msRequestFullscreen
        if (typeof rfs !== undefined && rfs) {
          rfs.call(el)
        }
        return
      } else {
        const newRFS =
          document.exitFullscreen ||
          document.msExitFullscreen ||
          document.mozCancelFullScreen ||
          document.webkitExitFullscreen
        newRFS.call(document)
      }
    }
  }

}
</script>

<style>
.fullscreen{
  width: 42px;
  height: 42px;
  cursor: pointer;
  font-size: 36px;
}
</style>