<style src="@/assets/css/index.scss"  lang="scss"></style>
<template>
  <div id="product-list-two">
    <h2>Product List Two</h2>
    <ul>
      <li v-for="(product,index) in products" :key="index">
        <span class="name">{{ product.name }}</span>
        <span class="price">${{ product.price }}</span>
      </li>
      <button @click="minusPrice(2)">减少价格</button>
      <button @click="minusPriceAsync(2)">异步减少价格</button>
    </ul>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      products: this.$store.state.shop.products
    };
  },
  methods: {
    // minusPrice() {
    //   //触发mutaions中的函数--store.commit()
    //   this.$store.commit("minusPrice", 2); //提交minusPrice,payload为2
    // },
    ...mapMutations({
      minusPrice: "shop/minusPrice" //映射为this.$store.commit("minusPrice")
    }),
    // minusPriceAsync() {
    //   //触发action中的函数--store.dispatch()
    //   this.$store.dispatch("minusPriceAsync", 2);
    // }
    ...mapActions({
      minusPriceAsync: "shop/minusPriceAsync" //映射为this.$store.dispatch("minusPriceAsync")
    })
  }
};
</script>