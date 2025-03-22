<script setup>
  import { ref, computed } from 'vue'
  import { useChatStore } from '../store/useChatStore'
  import { useRoomStore } from '../store/usrRoomStore'

  const chatStore = useChatStore()
  const roomStore = useRoomStore()
  const newMessage = ref('')

  // 发送消息处理
  const sendMessage = () => {
    if (newMessage.value.trim()) {
      // 这里添加实际的消息发送逻辑
      chatStore.talkRoom.push({
        user: '当前用户',
        content: newMessage.value,
        time: new Date().toLocaleTimeString()
      })
      newMessage.value = ''
    }
  }
</script>

<template>
  <div class="talk">
    <ScrollPanel style="height: calc(100% - 55px)">
      <div v-for="(msg, index) in chatStore.talkRoom" :key="index" class="message">
        <div class="message-header">
          <span class="username">{{ msg.user }}</span>
          <span class="timestamp">{{ msg.time }}</span>
        </div>
        <div class="message-content">{{ msg.content }}</div>
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
    background-color: aliceblue;
  }

  .message {
    margin: 8px 0;
    padding: 8px;
    background: rgba(201, 85, 85, 0.9);
    border-radius: 4px;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #666;
  }

  .input-area {
    height: 50px;
    padding: 5px 0;
    display: flex;
    align-items: center;
  }
</style>
