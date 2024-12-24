<template>
  <vue-draggable-resizable class-name="my-class1" class-name-handle="my-handle-class1" @dragging="onDrag1"
    @resizing="onResize1" :x="0" :w="400" :h="250" :min-width="220" :min-height="220" :lock-aspect-ratio="true"
    :drag-handle="'.drag-handle1'" :parent="true">

    <div class="drag-handle1">
      <slot name="title" style="z-index: 1001;"></slot>
    </div>
    <slot></slot>
  </vue-draggable-resizable>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

export default {
  data: function () {
    return {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    }
  },
  components: { VueDraggableResizable },
  methods: {
    onResize1(x, y, width, height) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    },
    onDrag1(x, y) {
      this.x = x;
      this.y = y
    }
  }
}
</script>

<style lang="less">
.my-class1 {
  // position: fixed;
  border: 1px solid #ddddddc5;
  background: #ffffffe1;
  font-size: 14px;
  box-shadow: 5px 5px 20px #bdbdbd;
  overflow: hidden;
  z-index: 999;
  border-radius: 5px;
}

.drag-handle1 {
  width: 100%;
  height: 30px;
  padding: 0 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
}

.my-handle-class1 {
  position: absolute;
  background-color: #ececec8c;
  // border: 1px solid black;
  border-radius: 2px;
  height: 10px;
  width: 10px;
  -webkit-transition: all 300ms linear;
  -ms-transition: all 300ms linear;
  transition: all 300ms linear;
  z-index: 1000;
}

.my-handle-class1-tl {
  // top: -5px;
  // left: -5px;
  cursor: nw-resize;
}

.my-handle-class1-tm {
  top: -5px;
  left: 50%;
  width: 200px;
  margin-left: -100px;
  cursor: n-resize;
}

.my-handle-class1-tr {
  right: 0px;
  cursor: ne-resize;
}

.my-handle-class1-ml {
  height: 200px;
  top: 50%;
  margin-top: -100px;
  left: -5px;
  cursor: w-resize;
}

.my-handle-class1-mr {
  height: 200px;
  top: 50%;
  margin-top: -100px;
  right: -5px;
  cursor: e-resize;
}

.my-handle-class1-bl {
  bottom: 0px;
  // left: 0px;
  cursor: sw-resize;
}

.my-handle-class1-bm {
  width: 200px;
  bottom: -5px;
  left: 50%;
  margin-left: -100px;
  cursor: s-resize;
}

.my-handle-class1-br {
  bottom: 0px;
  right: 0px;
  cursor: se-resize;
}

// .my-handle-class1-tl:hover,
// .my-handle-class1-tr:hover,
// .my-handle-class1-bl:hover,
// .my-handle-class1-br:hover {
//     background-color: #f0f0f0;
//     transform: scale(1.4);
// }
</style>