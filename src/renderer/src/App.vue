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
