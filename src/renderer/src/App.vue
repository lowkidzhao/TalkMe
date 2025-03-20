<script setup>
  import { onMounted, onUnmounted, watch } from 'vue'
  import titlebar from './components/titlebar.vue'
  import { useUserStore } from './store/useUserStore.js'
  import { useLinkStore } from './store/useLinkStore.js'
  import { OnlineUsers } from './socket/user.js'

  const userStore = useUserStore()
  const linkStore = useLinkStore()

  let removeListener = () => {}
  watch(
    () => linkStore.link,
    (newLink, oldLink) => {
      // 清理旧监听器
      if (oldLink) removeListener()

      if (newLink) {
        removeListener = OnlineUsers(newLink, (error, res) => {
          if (error) {
            console.error('在线用户监听错误:', error) // 加强错误日志
            return
          }
          // 转换数据格式（假设 res 是用户对象数组）
          userStore.setOnline(res)
        })
      }
    }
  )

  onUnmounted(() => {
    userStore.online = []
    removeListener()
  })
</script>

<template>
  <div class="ALL">
    <titlebar class="titlebar" />
    <div class="main">
      <Toast position="bottom-right" />
      <router-view> </router-view>
    </div>
  </div>
</template>
<style>
  .titlebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    height: 40px;
  }
  .main {
    background: url('../../../resources/index.jpg');
    background-size: cover; /* 添加图片缩放模式 */
    background-position: center; /* 添加图片居中 */
    margin-top: 30px;
    height: calc(100vh - 30px);
    overflow: auto;
  }
</style>
