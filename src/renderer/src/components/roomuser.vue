<script setup>
  import { watch, onMounted } from 'vue'
  import { GetRoomUser } from '../socket/user'
  import { useLinkStore } from '../store/useLinkStore'
  import { useRoomStore } from '../store/usrRoomStore'
  import { useChatStore } from '../store/useChatStore'

  const roomStore = useRoomStore()
  const linkStore = useLinkStore()
  const chatStore = useChatStore()

  // 监听当前房间的变化
  watch(
    () => roomStore.currentRoom,
    (newValue) => {
      if (newValue) {
        GetRoomUser(linkStore.link, roomStore.currentRoom)
          .then((res) => {
            roomStore.currentUser = res
            console.log(res)
          })
          .catch((err) => {
            console.log(err)
          })
      } else {
        roomStore.currentUser = []
      }
    }
  )
  // 新增私聊方法
  const startPrivateChat = (username) => {
    chatStore.user.push(username)
    // 这里可以添加跳转私聊窗口的逻辑
    console.log('开启私聊:', username)
  }
  onMounted(() => {
    // 初始化时清空私聊用户
    chatStore.user = []
  })
</script>
<template>
  <div class="roomuser">
    <ScrollPanel>
      <DataTable :value="roomStore.currentUser" tableStyle="min-width: 20px">
        <Column field="socketId" header="ID"></Column>
        <Column field="username" header="名称"></Column>
        <Column header="私聊">
          <template #body="{ data }">
            <Button
              label="私聊"
              icon="pi pi-comments"
              class="p-button-sm"
              @click="startPrivateChat(data.username)"
              :disabled="data.socketId === linkStore.link.id"
            />
          </template>
        </Column>
      </DataTable>
    </ScrollPanel>
  </div>
</template>
<style scoped>
  .roomuser {
    background-color: rgba(238, 230, 219, 0.932);
  }
</style>
