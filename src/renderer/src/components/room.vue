<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()
</script>
<template>
  <ScrollPanel style="width: 230px; height: 400px">服务器房间</ScrollPanel>
  <Button @click="router.push('/')">返回</Button>
</template>
<style scoped></style>
