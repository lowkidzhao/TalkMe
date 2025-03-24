<script setup>
  import { ref, onMounted, nextTick, watch } from 'vue'
  import { useAppToast } from '../utility/toast.js'
  import { useChatStore } from '../store/useChatStore'
  import { useLinkStore } from '../store/useLinkStore'
  import { useRoomStore } from '../store/usrRoomStore'
  import { Message } from '../socket/user.js'

  const chatStore = useChatStore()
  const { success, errorT } = useAppToast()
  const newMessage = ref('')
  const linkStore = useLinkStore()
  const scrollPanel = ref() // 添加滚动容器引用

  // 发送消息处理
  const sendMessage = () => {
    if (newMessage.value.trim()) {
      // 发送消息
      Message(linkStore.link, { message: newMessage.value })
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
          errorT(err)
        })
      newMessage.value = ''
      scrollToBottom() // 发送消息后滚动
    }
  }
  // 新增复制消息方法
  const copyMessage = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        success('复制成功')
      })
      .catch(() => {
        errorT('复制失败')
      })
  }
  // 滚动到底部方法
  const scrollToBottom = () => {
    nextTick(() => {
      if (scrollPanel.value?.$el) {
        // 查找实际的滚动容器
        const scrollContainer = scrollPanel.value.$el.querySelector('.p-scrollpanel-content')
        // 设置滚动位置
        scrollContainer && (scrollContainer.scrollTop = scrollContainer.scrollHeight)
      }
    })
  }
  watch(
    () => chatStore.talkRoom.length,
    () => {
      scrollToBottom()
    }
  )
</script>

<template>
  <div class="talk">
    <ScrollPanel ref="scrollPanel" style="height: calc(100% - 55px)">
      <div v-for="(msg, index) in chatStore.talkRoom" :key="index" class="message">
        <div class="message-header">
          <span class="username">{{ msg.name }}</span>
          <span class="timestamp">{{ msg.timestamp }}</span>
        </div>
        <div class="message-content" @click="copyMessage(msg.message)">{{ msg.message }}</div>
      </div>
    </ScrollPanel>

    <div class="input-area">
      <InputText
        v-model="newMessage"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
        style="width: calc(100% - 80px)"
      />
      <Button label="发送" @click="sendMessage" class="ml-2" />
    </div>
  </div>
</template>

<style scoped>
  .talk {
    height: calc(70% - 30px); /* 总高度70%减去输入框高度 */
    padding: 10px;
    display: flex;
    flex-direction: column;
    /* background-color: aliceblue; */
  }

  .message {
    margin: 4px 0;
    padding: 1px;
    background: rgba(238, 230, 219, 0.932);
    border-radius: 4px;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #666;
  }
  .message-content {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
  }
  .input-area {
    height: 50px;
    padding: 5px 0;
    display: flex;
    align-items: center;
  }
</style>
