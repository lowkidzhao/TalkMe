import { defineStore } from 'pinia'
import { ref } from 'vue' // 添加响应式 API

export const useUserStore = defineStore('usres', () => {
  // 使用 ref 创建响应式引用
  const users = ref([])
  const online = ref([])
  const setOnline = (newOnline) => {
    online.value = newOnline
  }
  return { users, online, setOnline }
})
