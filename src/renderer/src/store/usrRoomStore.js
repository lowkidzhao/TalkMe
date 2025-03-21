import { defineStore } from 'pinia'
import { ref } from 'vue' // 添加响应式 API

export const useRoomStore = defineStore('rooms', () => {
  // 使用 ref 创建响应式引用
  const rooms = ref([])
  const messages = ref([]) // 消息数组
  const currentRoom = ref(null) // 当前房间
  // 定义一个函数来更新 rooms 数组
  return { rooms, messages, currentRoom }
})
