<script setup>
  import { ref } from 'vue'
  import { useLinkStore } from '../store/useLinkStore'
  import { createLink } from '../socket/user.js'
  import { useToast } from 'primevue/usetoast'

  const toast = useToast() // 添加 toast 服务
  const linkStore = useLinkStore()
  const serverAddress = ref('114.132.41.169:1145')
  const serverType = ref('stun')
  const isLoading = ref(false)

  const handleConnect = async () => {
    try {
      isLoading.value = true

      // 创建连接并存储到全局状态
      linkStore.link = await createLink(serverAddress.value, serverType.value)

      console.log('服务器连接成功:', linkStore.link)
      // 添加成功提示
      toast.add({
        severity: 'success',
        summary: '连接成功',
        detail: '已成功建立服务器连接',
        life: 3000
      })
    } catch (error) {
      console.error('连接错误:', error)
      toast.add({
        severity: 'error',
        summary: '连接失败',
        detail: error,
        life: 5000
      })
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <div class="p-4">
    <div class="space-y-4">
      <FloatLabel>
        <InputText
          id="serverAddress"
          v-model="serverAddress"
          placeholder="服务器地址"
          :disabled="isLoading"
        />
        <label for="serverAddress">服务器地址 (例: 127.0.0.1:1145)</label>
      </FloatLabel>

      <FloatLabel style="margin-top: 30px">
        <Select
          v-model="serverType"
          :options="[
            { label: 'STUN', value: 'stun' },
            { label: 'TURN', value: 'turn' }
          ]"
          optionLabel="label"
          placeholder="选择服务器类型"
          :disabled="isLoading"
        />
        <label for="serverType">服务器类型</label>
      </FloatLabel>

      <Button
        :label="isLoading ? '连接中...' : '立即连接'"
        :disabled="isLoading"
        @click="handleConnect"
      />
      <!-- 替换 Toast 组件为 Vue 语法 -->
      <Toast position="bottom-center"> </Toast>
    </div>
  </div>
</template>
<style scoped>
  .p-4 {
    display: inline-block; /* 使宽度随内容扩展 */
  }
  .space-y-4 {
    max-width: 400px;
    padding: 10px;
  }

  button {
    margin-top: 15px;
  }
</style>
