<template>
  <div class="container">
    <router-view name="header"></router-view>
    <div class="con">
      <div class="box">1</div>
      <div class="box">2</div>
      <div class="box">3</div>
      <div class="box">4</div>
      <div class="box">5</div>
      <div class="box">6</div>
      <div class="box">7</div>
      <div class="box">8</div>
    </div>
    <router-view name="footer"></router-view>
  </div>
</template>

<script>

export default {
  name: "index",
  data() {
    return {};
  }
};
</script>
