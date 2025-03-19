<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { GetAll } from '../socket/user.js'
  import { useAppToast } from '../utility/toast.js'
  import { useLinkStore } from '../store/useLinkStore.js'
  import { useUserStore } from '../store/useUserStore.js'

  const linkStore = useLinkStore()
  const userStore = useUserStore()
  const { errorT } = useAppToast()
  const getAll = () => {
    if (!linkStore.link) {
      errorT('请先连接服务器')
      return
    }
    GetAll(linkStore.link)
      .then((res) => {
        userStore.users = res.map((username, index) => ({
          id: index + 1,
          username
        }))
      })
      .catch((err) => {
        errorT('获取失败')
        console.log(err)
      })
  }
  // 创建响应式判断方法
  const isUserOnline = computed(() => (username) => {
    return userStore.online?.includes(username)
  })
  // 添加定时器引用
  const refreshInterval = ref(null)

  onMounted(() => {
    if (linkStore.link) {
      getAll()
      refreshInterval.value = setInterval(() => {
        if (linkStore.link) getAll()
      }, 60000)
    }
  })
  onUnmounted(() => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  })
</script>
<template>
  <div class="user-list-container">
    <ScrollPanel style="width: 230px; height: 400px">
      <DataTable :value="userStore.users" stripedRows class="p-datatable-sm">
        <Column field="username" header="用户列表">
          <template #body="{ data }">
            <div class="user-item">
              <span>{{ data.username }}</span>
              <Badge
                :value="isUserOnline(data.username) ? '在线' : '离线'"
                :severity="isUserOnline(data.username) ? 'success' : 'secondary'"
                class="status-badge"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </ScrollPanel>
  </div>
</template>
<style scoped>
  .user-list-container {
    padding: 1rem;
  }

  .user-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
  }

  .status-badge {
    margin-left: auto;
  }

  /* 保持原有滚动条样式 */
  :deep(.p-scrollpanel) ::-webkit-scrollbar {
    width: 8px;
  }

  /* 添加表格样式 */
  :deep(.p-datatable) {
    border: none;
  }

  :deep(.p-datatable .p-datatable-header) {
    background: transparent;
    border: none;
  }
</style>
