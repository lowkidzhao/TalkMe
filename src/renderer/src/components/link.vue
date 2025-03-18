<script setup>
  import { ref } from 'vue'
  import { useLinkStore } from '../store/useLinkStore'
  import { createLink } from '../socket/user.js'
  import { useAppToast } from '../utility/toast.js'

  const { success, errorT } = useAppToast()
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
      success('连接成功', '已成功建立服务器连接')
    } catch (error) {
      console.error('连接错误:', error)
      errorT('连接失败', error.message)
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <div class="tt p-4">
    <div class="space-y-4">
      <FloatLabel style="margin-top: 15px; margin-bottom: 30px">
        <InputText
          id="serverAddress"
          v-model="serverAddress"
          placeholder="服务器地址"
          :disabled="isLoading"
        />
        <label for="serverAddress">服务器地址 (例: 127.0.0.1:1145)</label>
      </FloatLabel>

      <FloatLabel>
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
    </div>
  </div>
</template>
<style scoped>
  .tt {
    width: fit-content;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
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
