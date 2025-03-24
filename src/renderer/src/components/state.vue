<script setup>
  import { useRouter } from 'vue-router'
  const router = useRouter()
</script>

<template>
  <div class="all">
    <span>显示设置与连接状态</span>
    <Button @click="router.push('/')">返回</Button>
  </div>
</template>
<style scoped>
  .all {
    display: flex;
    flex-direction: column; /* 垂直布局 */
    align-items: center; /* 水平居中 */
    justify-content: center; /* 垂直居中 */
    /* height: 100%; 全屏高度 */
    background-color: #f0f0f0; /* 背景色 */
  }
</style>
