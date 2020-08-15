export default {
  props: {
    unit: {
      type: Number
    },
    item: {
      type: Object
    },
    trackIndex: {
      type: Number
    }
  },
  mounted() {
    this.init();
  },
  updated() {
    this.init();
  }
}