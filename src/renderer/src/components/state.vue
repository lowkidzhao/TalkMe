<script setup>
  import { useRouter } from 'vue-router'
  import { onMounted } from 'vue' // 正确导入生命周期钩子
  import { GetState } from '../utility/webrtc'
  import { useLinkStore } from '../store/useLinkStore'

  const router = useRouter()
  const linkStore = useLinkStore()

  onMounted(async () => {
    if (!linkStore.state) {
      router.push('/')
    } else {
      setInterval(async () => {
        linkStore.state = await GetState(linkStore.link.rtc_link)
        // console.log('连接状态:', {
        //   当前是否连接: linkStore.state.isConnected,
        //   ICE状态: linkStore.state.iceState,
        //   传输协议: linkStore.state.protocol,
        //   本地IP: linkStore.state.localIP,
        //   远端IP: linkStore.state.remoteIP,
        //   传输层状态: linkStore.state.transportState
        // })
      }, 2000)
    }
  })
</script>

<template>
  <div class="all">
    <div>{{ linkStore.state }}</div>
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
