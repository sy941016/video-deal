<style src="@/assets/css/index.scss"  lang="scss"></style>
<template>
  <div id="product-list-one">
    <h2>Product List One</h2>
    <h4>父组件传来的信息：{{who}}</h4>
    <button @click="child">child->father</button>
    <ul>
      <li v-for="(product,index) in saleProducts" :key="index">
        <span class="name">{{ product.name }}</span>
        <span class="price">${{ product.price }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      products: this.$store.state.shop.products,
      msg: "I'm your son"
    };
  },
  props: {
    who: {
      type: String
    }
  },
  methods: {
    child: function() {
      this.$emit("by_child", this.msg);
    }
  },
  computed: {
    ...mapGetters({
      saleProducts: "shop/saleProducts"
    })
  }
};
</script>