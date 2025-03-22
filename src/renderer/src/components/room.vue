<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAppToast } from '../utility/toast.js'
  import { useRoomStore } from '../store/usrRoomStore'
  import { useLinkStore } from '../store/useLinkStore'
  import { GetRoom, JoinRoom, LeaveRoom } from '../socket/user'

  const { success, errorT } = useAppToast()
  const router = useRouter()
  const roomStore = useRoomStore()
  const linkStore = useLinkStore()

  const joinRoom = async (data) => {
    JoinRoom(linkStore.link, { name: data.name, password: '' })
      .then((res) => {
        roomStore.currentRoom = data
        console.log(res)
        success('加入房间成功')
      })
      .catch((err) => {
        console.log(err)
        errorT('加入房间失败')
      })
  }
  const getRoom = async () => {
    GetRoom(linkStore.link)
      .then((res) => {
        roomStore.rooms = res
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
        errorT('获取房间失败')
      })
  }
  const leaveRoom = async () => {
    LeaveRoom(linkStore.link)
      .then((res) => {
        success(res)
        roomStore.currentRoom = null
      })
      .catch((err) => {
        console.log(err)
        errorT('退出房间失败')
      })
  }
  onMounted(() => {
    getRoom()
  })
</script>
<template>
  <div class="user-list-container">
    <ScrollPanel style="width: 230px; height: 100%">
      <DataTable :value="roomStore.rooms" tableStyle="min-width: 50px">
        <Column field="name" header="房间"></Column>
        <Column header="操作" :styles="{ 'min-width': '100px' }">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-sign-in"
                severity="success"
                @click="joinRoom(data)"
                v-tooltip="'加入房间'"
              />
              <Button
                icon="pi pi-sign-out"
                severity="success"
                @click="leaveRoom()"
                v-tooltip="'退出房间'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <Button @click="router.push('/')">返回</Button>
    </ScrollPanel>
  </div>
</template>
<style scoped>
  .user-list-container {
    width: fit-content;
    height: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* 同步表格样式 */
  :deep(.p-datatable) {
    border: none;
    background: transparent;

    .p-datatable-tbody tr {
      background: rgba(238, 230, 219, 0.932) !important;
    }

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
</style>
