<style src="@/assets/css/videoDeal.scss" lang="scss"></style>
<template>
  <div class="track audio-track">
    <TextPiece
      v-for="( text,index) in  textArr"
      :item=" text"
      :key="index"
      v-bind="$attrs"
      v-on="$listeners"
    ></TextPiece>
  </div>
</template>
<script>
import TextPiece from "./textPiece.vue";

export default {
  name: "TextTrack",
  components: {
    TextPiece
  },
  props: {
    textArr: {
      type: Array
    }
  }
};
</script>
