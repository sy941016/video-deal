<template>
  <header>
    <el-menu
      default-active="1"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="1">
        <router-link to="/videoDeal">视频</router-link>
      </el-menu-item>
      <el-menu-item index="2">
        <router-link to="/shop">商品</router-link>
      </el-menu-item>
      <el-submenu index="3" style="float:right">
        <template slot="title">个人中心</template>
        <el-menu-item index="3-1">name:{{name}}</el-menu-item>
        <el-menu-item index="3-2" @click="logout">登出</el-menu-item>
      </el-submenu>
    </el-menu>
  </header>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "headerNav",
  data() {
    return {};
  },
  methods: {
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login`);
    }
  },
  computed: {
    ...mapGetters(["name"])
  }
};
</script>