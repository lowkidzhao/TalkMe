<script setup>
  import { useLinkStore } from './store/useLinkStore'
  import titlebar from './components/titlebar.vue'
  import login from './components/login.vue'
  import linkView from './components/link.vue'

  const LinkStore = useLinkStore()
</script>

<template>
  <titlebar />
  <div>
    <div>
      <Toast position="top-right" />
      <linkView v-if="!LinkStore.link" />
      <login />
    </div>
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
</style>
