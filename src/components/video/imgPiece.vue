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
    ref="img"
    :z="zIndex"
    :x="item.left"
    :minWidth="5"
  >
    <div
      class="img-box"
      @click="pieceMes"
      @click.right="pieceMes"
      tabindex="0"
      @keyup.ctrl.67="copy"
      @keyup.ctrl.88="cut"
      @keyup.delete.exact="del"
      @mousedown="pieceMes"
      :style="'background-image:' + item.backgroundImage +';background-position:' + item.backgroundPosition"
    ></div>
  </vue-draggable-resizable>
</template>
<script>
import vueCommon from "@/util/method";
import Piece from "@/mixin/piece"
//拖拽缩放组件
import VueDraggableResizable from "../drag-resize/components/vue-draggable-resizable.vue";
import "../drag-resize/components/vue-draggable-resizable.css";

export default {
  components: { VueDraggableResizable },
  name: "imgPiece",
  mixins: [
    Piece
  ],
  data: function() {
    return {
      handles: ["mr", "ml"],
      zIndex: 999
    };
  },
  methods: {
    init() {
      if (this.item.backgroundPosition.length == 0) {
        this.item.vdrWidth = Math.floor(
          (this.item.e_ruler - this.item.s_ruler) * this.unit
        );
        this.drawBackground();
      }
      this.item.eTime = this.item.e_ruler;
      this.offsetTime = this.item.s_ruler;
      this.item.left = Math.floor(this.offsetTime * this.unit);
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      this.updateZIndex();
      this.$emit("clip");
    },
    //piece的层级设置
    updateZIndex() {
      this.zIndex = this.item.selected
        ? vueCommon.seletedZIndex
        : vueCommon.unselectedZIndex;
    },
    //获取帧图片
    drawBackground() {
      let drawObj = {
        width: this.item.vdrWidth,
        imgUrl: this.item.url,
        frameImageWidth: this.item.frameImageWidth
      };

      [
        this.item.backgroundImage,
        this.item.backgroundPosition
      ] = vueCommon.drawImgBackground(drawObj);
    },
    onResizeStartCallback: function(handle) {
      this.handle = handle;
    },
    onResize: function(x, y, width) {
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      if (this.handle == "mr") {
        this.item.eTime = this.item.widthSum / this.unit;
        this.item.e_ruler = this.item.eTime;
      } else if (this.handle == "ml") {
        this.item.left -= width - this.item.vdrWidth;
        this.item.s_ruler = this.item.left / this.unit;
      }
      this.item.vdrWidth = width;
      this.drawBackground();

      this.$emit("clip");
    },
    onResizstop: function() {
      this.$emit("overlap", this.item, this.trackIndex);
      this.$emit("record");
    },
    onDragging: function() {},
    onDragstop: function(left) {
      let emitRecord = this.item.left != left;
      this.item.left = left;
      //位移时长
      this.offsetTime = left / this.unit;
      //视频时长应加上位移视频时长
      this.item.widthSum = this.item.left + this.item.vdrWidth; //截取的总宽度
      this.item.eTime = this.item.widthSum / this.unit;
      this.item.s_ruler = this.offsetTime;
      this.item.e_ruler = this.item.eTime;
      this.$emit("overlap", this.item, this.trackIndex);
      if (emitRecord) {
        this.$emit("clip");
        this.$emit("record");
      }
    },
    pieceMes: function() {
      this.$emit("pieceMes", this.item);
    },
    //ctrl+c
    copy: function() {
      this.$emit("copy", this.item);
    },
    //ctrl+x
    cut: function() {
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
    }
  },
  watch: {
    unit(newValue) {
      this.unit = newValue;
      this.item.vdrWidth = Math.floor(
        (this.item.e_ruler - this.item.s_ruler) * newValue
      );
      this.drawBackground();
      //处理缩放后的偏移量
      this.item.left = Math.floor(this.offsetTime * newValue);
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      this.unit = newValue;
      this.$emit("clip");
    }
  }
};
</script>
