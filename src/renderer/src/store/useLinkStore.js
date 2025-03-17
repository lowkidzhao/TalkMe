import { defineStore } from 'pinia'
import { ref } from 'vue' // 添加响应式 API

export const useLinkStore = defineStore('link', () => {
  // 使用 ref 创建响应式引用
  const link = ref(null)

  return { link }
})
