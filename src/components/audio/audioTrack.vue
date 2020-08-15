<style src="@/assets/css/videoDeal.scss" lang="scss"></style>
<template>
  <div class="track audio-track">
    <AudioPiece
      v-for="(audio,index) in  audioArr"
      :item="audio"
      :key="index"
      v-bind="$attrs"
      v-on="$listeners"
    ></AudioPiece>
  </div>
</template>
<script>
import AudioPiece from "./audioPiece.vue";

export default {
  name: "AudioTrack",
  components: {
    AudioPiece
  },
  props: {
    audioArr: {
      type: Array
    }
  }
};
</script>
