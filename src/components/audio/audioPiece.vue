<style src="@/assets/css/videoDeal.scss" lang="scss"></style>
<template>
  <vue-draggable-resizable
    :w="item.vdrWidth"
    :h="item.vdrHeight"
    :handles="['mr', 'ml']"
    :active="item.selected"
    :parent="true"
    ref="audio"
    :onResizeStart="onResizeStartCallback"
    @resizing="onResize"
    @resizestop="onResizstop"
    @dragging="onDragging"
    @dragstop="onDragstop"
    @selected="selected"
    :x="item.left"
    :unit="unit"
    :maxWidth="this.maxWidth"
    :minWidth="5"
    :z="zIndex"
  >
    <div
      class="audio-background"
      ref="background"
      @click="pieceMes"
      @click.right="pieceMes"
      tabindex="0"
      @keyup.ctrl.67="copy"
      @keyup.ctrl.88="cut"
      @keyup.delete.exact="del"
      @mousedown="pieceMes"
    />
    <canvas ref="canvas" :width="item.time * unit" :height="item.vdrHeight" v-show="false" />
  </vue-draggable-resizable>
</template>
<script>
import vueCommon from "@/util/method";
import Piece from "@/mixin/piece";
import VueDraggableResizable from "../drag-resize/components/vue-draggable-resizable.vue";
import "../drag-resize/components/vue-draggable-resizable.css";

export default {
  components: {
    VueDraggableResizable,
  },
  name: "AudioPiece",
  mixins: [Piece],
  data: function () {
    return {
      audioArr: [],
      maxWidth: null,
      zIndex: 999,
    };
  },
  methods: {
    init() {
      this.item.vdrWidth = Math.floor(
        (this.item.e_time - this.item.s_time) * this.unit
      );
      this.item.vdrHeight = 30;
      this.item.eTime = this.item.e_ruler;
      this.item.left = Math.floor(this.item.s_ruler * this.unit);
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      this.offsetTime = this.item.s_ruler;
      this.$emit("clip");
      this.bufferLen = 44100 * this.item.time;
      if (this.$refs.background.style.backgroundImage == "") {
        this.drawBackground();
      } else {
        let backgroundPos = -Math.floor(
          Math.max(this.item.s_time, 0) * this.unit
        );

        this.$refs.background.style.backgroundPosition =
          backgroundPos + "px 0px";
      }

      this.updateZIndex();
    },
    //piece的层级设置
    updateZIndex() {
      this.zIndex = this.item.selected
        ? vueCommon.seletedZIndex
        : vueCommon.unselectedZIndex;
    },
    drawBackground() {
      this.drawObj = {
        bufferLen: this.bufferLen,
        url: this.item.url,
        time: this.item.time,
        s_time: this.item.s_time,
        unit: this.unit,
        width: this.item.vdrWidth,
        height: this.item.vdrHeight,
        canvas: this.$refs.canvas,
        background: this.$refs.background,
      };
      vueCommon.getAudioDataAndDrawBackground(this.drawObj, (audioData) => {
        this.audioArr = audioData;
      });
    },
    //拖拽组件插件event
    onResizeStartCallback: function (handle /*, ev*/) {
      this.handle = handle;
      if (handle == "ml") {
        let maxwidthL =
          this.item.vdrWidth +
          (this.item.vdrWidth / (this.item.e_time - this.item.s_time)) *
            this.item.s_time;
        this.maxWidth = maxwidthL;
        return { maxWidth: maxwidthL };
      } else if (handle == "mr") {
        let maxwidthR =
          this.item.vdrWidth +
          (this.item.vdrWidth / (this.item.e_time - this.item.s_time)) *
            (this.item.time - this.item.e_time);
        this.maxWidth = maxwidthR;
        return { maxWidth: maxwidthR };
      }
    },
    onResize(x, y, width) {
      if (width <= 0) return;
      //缩小的width/width=缩小时间/截取时间
      let deltaTime =
        ((width - this.item.vdrWidth) / this.item.vdrWidth) *
        (this.item.e_time - this.item.s_time);
      if (this.handle == "mr") {
        this.item.e_time = this.item.e_time + deltaTime;
        //拖拉mr ,更新总时长;拖拉ml  时长不变
        this.item.e_ruler =
          this.item.e_time - this.item.s_time + this.offsetTime;
        this.handleDom = document.getElementsByClassName("handle-mr")[0];
      } else if (this.handle == "ml") {
        this.item.s_time = this.item.s_time - deltaTime;
        this.item.left -= width - this.item.vdrWidth;
        this.item.s_ruler = this.item.s_ruler - deltaTime;
        this.handleDom = document.getElementsByClassName("handle-ml")[0];
      }
      width >= this.maxWidth
        ? (this.handleDom.style.background = "red")
        : (this.handleDom.style.background = "#F9B703");
      this.item.vdrWidth = width;
      this.item.eTime = this.item.e_ruler;
      this.item.widthSum = this.item.vdrWidth + this.item.left;

      //改变背景图位置
      const backgroundPos = -Math.floor(
        Math.max(this.item.s_time, 0) * this.unit
      );
      this.$refs.background.style.backgroundPosition = backgroundPos + "px 0px";

      this.$emit("clip");
    },
    onResizstop: function () {
      this.maxWidth = null;
      this.$emit("overlap", this.item, this.trackIndex);
      this.$emit("record");
      this.handleDom.style.background = "#F9B703";
    },
    onDragging: function () {},
    onDragstop: function (left) {
      let emitRecord = this.item.left != left;
      this.item.left = left;
      //位移时长
      this.offsetTime = left / this.unit;
      //视频时长应加上位移视频时长
      this.item.eTime = this.item.e_time - this.item.s_time + this.offsetTime;
      this.item.widthSum = this.item.left + this.item.vdrWidth; //截取的总宽度
      this.item.s_ruler = this.offsetTime;
      this.item.e_ruler = this.item.eTime;
      this.$emit("overlap", this.item, this.trackIndex);
      if (emitRecord) {
        this.$emit("clip");
        this.$emit("record");
      }
    },
    pieceMes: function () {
      this.$emit("pieceMes", this.item);
    },
    //ctrl+c
    copy: function () {
      this.$emit("copy", this.item);
    },
    //ctrl+x
    cut: function () {
      this.$emit("cut", this.item);
      this.$emit("record");
    },
    // delete删除
    del() {
      this.$emit("del", this.item);
      this.$emit("record");
    },
    //是否选中
    selected(val) {
      this.item.selected = val;
      this.updateZIndex();
    },
  },
  watch: {
    unit(newValue) {
      this.maxWidth = null;
      this.unit = newValue;
      this.item.vdrWidth = Math.floor(
        (this.item.e_time - this.item.s_time) * newValue
      );
      //处理缩放后的偏移量
      this.item.left = Math.floor(this.offsetTime * newValue);
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      //重绘audio波形
      this.drawObj.width = this.item.vdrWidth;
      this.drawObj.unit = this.unit;
      vueCommon.drawAudioBackground(this.audioArr, this.drawObj);
      this.$emit("clip");
    },
  },
};
</script>
