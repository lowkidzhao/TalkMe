<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { GetAll, GetOnlineUsers } from '../socket/user.js'
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
      GetOnlineUsers(linkStore.link)
        .then((res) => {
          userStore.online = res
        })
        .catch((err) => {
          errorT('获取失败')
          console.log(err)
        })
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
    <ScrollPanel style="width: 230px; height: 70vh">
      <DataTable :value="userStore.users" class="p-datatable-sm">
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
    width: fit-content;
    /* padding: 1rem; */
    background-color: rgba(238, 230, 219, 0.932, 0.8); /* 添加浅灰色背景 */
    border-radius: 8px; /* 圆角效果 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  }

  .user-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    background: rgba(238, 230, 219, 0.932, 0.8); /* 半透明白色背景 */
    border-radius: 4px; /* 行圆角 */
    margin: 2px 0; /* 增加行间距 */
  }

  .status-badge {
    margin-left: auto;
  }

  /* 添加表格样式 */
  :deep(.p-datatable) {
    border: none;
    background: transparent;
    /* 新增表格行背景色 */
    .p-datatable-tbody tr {
      background: rgba(238, 230, 219, 0.932) !important;
    }

    /* 修改表头背景 */
    .p-datatable-thead {
      tr {
        background: rgba(238, 230, 219, 0.932) !important;
        th {
          background: transparent !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
        }
      }
    }
  }

  :deep(.p-datatable .p-datatable-header) {
    background: transparent;
    border: none;
  }
</style>
