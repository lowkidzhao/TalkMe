<script setup>
  import titlebar from './components/titlebar.vue'
</script>

<template>
  <titlebar class="titlebar" />
  <div class="main">
    <Toast position="bottom-right" />
    <router-view> </router-view>
  </div>
</template>
<style>
  .p-button {
    background-color: rgb(245, 236, 225) !important;
    border-color: rgb(245, 236, 225) !important;
    color: #333 !important; /* 修改文字颜色为深色增加对比度 */
  }

  .p-button:hover {
    background-color: rgb(175, 163, 152) !important;
    border-color: rgb(175, 163, 152) !important;
  }
  .titlebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
  }
  .main {
    margin-top: 40px;
  }
</style>
