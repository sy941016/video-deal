<style src="@/assets/css/videoDeal.scss" lang="scss"></style>
<template>
  <vue-draggable-resizable
    :w="item.vdrWidth"
    :h="item.vdrHeight"
    :handles="['mr', 'ml']"
    :parent="true"
    ref="text"
    :onResizeStart="onResizeStartCallback"
    @resizing="onResize"
    @resizestop="onResizstop"
    @dragging="onDragging"
    @dragstop="onDragstop"
    @selected="selected"
    :active="item.selected"
    :x="item.left"
    :unit="unit"
    :z="zIndex"
  >
    <div
      class="text"
      @click="pieceMes"
      @click.right="pieceMes"
      tabindex="0"
      @keyup.ctrl.67="copy"
      @keyup.ctrl.88="cut"
      @keyup.delete.exact="del"
    >{{item.subtitles}}</div>
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
  name: "TextPiece",
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
      this.item.vdrWidth = Math.floor(
        (this.item.e_time - this.item.s_time) * this.unit
      );
      this.item.vdrHeight = 30;
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
    //拖拽组件插件event
    onResizeStartCallback: function(handle) {
      this.handle = handle;
    },
    onResize: function(x, y, width) {
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
      } else if (this.handle == "ml") {
        this.item.s_time = this.item.s_time - deltaTime;
        this.item.left -= width - this.item.vdrWidth;
        this.item.s_ruler = this.item.s_ruler - deltaTime;
      }
      this.item.vdrWidth = width;
      this.item.eTime = this.item.e_ruler;
      this.item.widthSum = this.item.vdrWidth + this.item.left;

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
        (this.item.e_time - this.item.s_time) * newValue
      );
      //处理缩放后的偏移量
      this.item.left = Math.floor(this.offsetTime * newValue);
      this.item.widthSum = this.item.vdrWidth + this.item.left;
      this.$emit("clip");
    }
  }
};
</script>
