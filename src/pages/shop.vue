<template>
  <div>
    <h2>子组件传来的信息：{{answer}}</h2>
    <product-list-one :who="who" @by_child="father"></product-list-one>
    <product-list-two></product-list-two>
  </div>
</template>

<script>
import ProductListOne from "@/components/shop/ProductListOne";
import ProductListTwo from "@/components/shop/ProductListTwo";

export default {
  name: "shop",
  components: {
    ProductListOne,
    ProductListTwo
  },
  data() {
    return {
      who: "I'm your father",
      answer: ""
    };
  },
  methods: {
    father(msg) {
      this.answer = msg;
    }
  }
};
</script>
