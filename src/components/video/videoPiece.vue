<style src="@/assets/css/videoDeal.scss" lang="scss"></style>
<template>
  <vue-draggable-resizable
    :w="item.vdrWidth"
    :h="item.frameImageHeight"
    :onResizeStart="onResizeStartCallback"
    @dragging="onDragging"
    @dragstop="onDragstop"
    @resizing="onResize"
    @resizestop="onResizstop"
    @selected="selected"
    :active="item.selected"
    :handles="handles"
    :parent="true"
    :z="zIndex"
    ref="video"
    :x="item.left"
    :maxWidth="this.maxWidth"
    :minWidth="5"
  >
    <div
      class="jiequ"
      ref="jiequ"
      @click.right="pieceMes"
      @click="pieceMes"
      tabindex="0"
      @keyup.ctrl.67="copy"
      @keyup.ctrl.88="cut"
      @keyup.delete.exact="del"
      @mousedown="pieceMes"
    >
      <div class="audio-background" ref="background" v-show="item.is_audio==1" />
      <canvas ref="canvas" :width="item.time * unit" :height="item.vdrHeight" v-show="false" />
    </div>
  </vue-draggable-resizable>
</template>
<script>
import vueCommon from "@/util/method";
import Piece from "@/mixin/piece";
//拖拽缩放组件
import VueDraggableResizable from "../drag-resize/components/vue-draggable-resizable.vue";
import "../drag-resize/components/vue-draggable-resizable.css";

export default {
  components: { VueDraggableResizable },
  name: "VideoPiece",
  mixins: [Piece],
  data: function () {
    return {
      handles: ["mr", "ml"],
      maxWidth: null,
      zIndex: 999,
    };
  },
  methods: {
    init() {
      this.bufferLen = 44100 * this.item.time;
      this.item.vdrWidth = Math.floor(
        (this.item.e_time - this.item.s_time) * this.unit
      );
      this.drawBackground();

      if (this.item.is_audio == 1) {
        if (this.$refs.background.style.backgroundImage == "") {
          this.drawAudioBackground();
        } else {
          let backgroundPos = -Math.floor(
            Math.max(this.item.s_time, 0) * this.unit
          );

          this.$refs.background.style.backgroundPosition =
            backgroundPos + "px 0px";
        }
      }

      this.item.eTime = this.item.e_ruler;
      this.item.left = Math.floor(this.item.s_ruler * this.unit);
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      this.offsetTime = this.item.s_ruler;
      this.updateZIndex();
      this.$emit("clip");
    },
    //piece的层级设置
    updateZIndex() {
      this.zIndex = this.item.selected
        ? vueCommon.seletedZIndex
        : vueCommon.unselectedZIndex;
    },
    //绘制video背景
    drawBackground() {
      if (this.item.s_time < 0) {
        this.item.s_time = 0;
      }

      if (this.item.e_time > this.item.time) {
        this.item.e_time = this.item.time;
      }

      let drawObj = {
        s_time: this.item.s_time,
        e_time: this.item.e_time,
        width: this.item.vdrWidth,
        totalImgNum: this.item.imagesNum,
        imgUrl: this.item.thumbnail,
        time: this.item.time,
        frameImageWidth: this.item.frameImageWidth,
        frameImageHeight: this.item.frameImageHeight,
      };

      [
        this.item.backgroundImage,
        this.item.backgroundPosition,
      ] = vueCommon.drawVideoBackground(drawObj);
      this.$refs.jiequ.style.backgroundImage = this.item.backgroundImage;
      this.$refs.jiequ.style.backgroundPosition = this.item.backgroundPosition;
    },
    //绘制audio背景
    drawAudioBackground() {
      this.audioObj = {
        bufferLen: this.bufferLen,
        url: this.item.acodec,
        time: this.item.time,
        s_time: this.item.s_time,
        unit: this.unit,
        width: this.item.vdrWidth,
        height: 20,
        canvas: this.$refs.canvas,
        background: this.$refs.background,
      };
      vueCommon.getAudioDataAndDrawBackground(this.audioObj, (audioData) => {
        this.audioArr = audioData;
      });
    },
    //拖拽组件插件event
    onResizeStartCallback: function (handle) {
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
    onResize: function (x, y, width) {
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
      this.drawBackground();
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
      this.drawBackground();
      //重绘audio波形
      if (this.audioObj) {
        this.audioObj.width = this.item.vdrWidth;
        this.audioObj.unit = this.unit;
        vueCommon.drawAudioBackground(this.audioArr, this.audioObj);
      }
      //处理缩放后的偏移量
      this.item.left = Math.floor(this.offsetTime * newValue);
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      this.unit = newValue;
      this.$emit("clip");
    },
  },
};
</script>
