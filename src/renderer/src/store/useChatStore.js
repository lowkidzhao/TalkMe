import { defineStore } from 'pinia'
import { ref } from 'vue' // 添加响应式 API

export const useChatStore = defineStore('chat', () => {
  // 使用 ref 创建响应式引用
  const talkRoom = ref([]) // 存储群聊消息 {user, content, time}
  const talkprivate = ref([]) // 私聊数据{userName: '张三', messages: 'hello'}
  const user = ref([]) //当前对话窗口（单指用户）

  return { talkRoom, talkprivate, user }
})
