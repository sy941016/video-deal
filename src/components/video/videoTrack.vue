<style src="@/assets/css/videoDeal.scss" lang="scss"></style>
<template>
  <div class="track video-track">
    <template v-for="(video,index) in  videoArr">
      <VideoPiece
        :item="video"
        :key="index"
        v-on="$listeners"
        v-bind="$attrs"
        v-if="video.type=='v'"
      ></VideoPiece>
      <ImgPiece :item="video" :key="index" v-on="$listeners" v-bind="$attrs" v-if="video.type=='i'"></ImgPiece>
    </template>
  </div>
</template>
<script>
import VideoPiece from "./videoPiece.vue";
import ImgPiece from "./imgPiece.vue";

export default {
  name: "VideoTrack",
  components: {
    VideoPiece,
    ImgPiece,
  },
  props: {
    videoArr: {
      type: Array,
    },
  },
};
</script>
