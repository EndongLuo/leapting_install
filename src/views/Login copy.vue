<template>
  <div>

    <p>{{ second }}</p>
  </div>
</template>
  
<script >
export default {

  data() { return { seconds: 30 } },
  mounted() { this.add() },
  methods: {
    num(n) { return n < 10 ? '0' + n : '' + n },
    add() {
      var time = setInterval(() => {
        if (this.seconds === 0) this.seconds = 0;
        else if (this.seconds === 0) {
          this.seconds = 0;
          clearInterval(time);
        }
        else this.seconds -= 1;
      }, 1000)
    }
  },
  computed: { second() { return this.num(this.seconds) }, }
}
</script>