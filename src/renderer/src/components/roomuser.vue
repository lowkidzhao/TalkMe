<script setup>
  import { watch, onMounted } from 'vue'
  import { useAppToast } from '../utility/toast.js'
  import { GetRoomUser, User_left, User_join, NewMessage, GetMessage } from '../socket/user'
  import { useLinkStore } from '../store/useLinkStore'
  import { useRoomStore } from '../store/useRoomStore.js'
  import { useChatStore } from '../store/useChatStore'

  const roomStore = useRoomStore()
  const linkStore = useLinkStore()
  const chatStore = useChatStore()
  const { success, errorT } = useAppToast()
  let RemoveUser_left = () => {}
  let RemoveUser_join = () => {}
  let RemoveNewMessage = () => {}
  // 监听当前房间的变化
  watch(
    () => roomStore.currentRoom,
    (newValue, oldValue) => {
      if (oldValue) {
        RemoveUser_left()
        RemoveUser_join()
        RemoveNewMessage()
        console.log('已移除旧房间监听器')
      }
      if (newValue) {
        console.log('正在初始化房间:', newValue)
        // 初始化聊天记录
        GetMessage(linkStore.link, roomStore.currentRoom)
          .then((res) => {
            console.log('GetMessage 收到响应', res) // 添加调试日志
            chatStore.talkRoom = res
          })
          .catch((err) => {
            console.error('GetMessage 请求失败:', err) // 增强错误日志
            console.log(roomStore.currentRoom)
          })
        GetRoomUser(linkStore.link, roomStore.currentRoom)
          .then((res) => {
            roomStore.currentUser = res
            console.log('房间内用户：' + res)
            // 监听用户加入
            RemoveUser_join = User_join(linkStore.link, (err, res) => {
              if (err) {
                console.log(err)
                return
              } else {
                console.log(res)
                success(res + '加入房间')
                GetRoomUser(linkStore.link, roomStore.currentRoom)
                  .then((res) => {
                    roomStore.currentUser = res
                    console.log(res)
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }
            })
            // 监听用户离开
            RemoveUser_left = User_left(linkStore.link, (err, res) => {
              if (err) {
                console.log(err)
                return
              } else {
                console.log(res)
                success(res + '离开房间')
                GetRoomUser(linkStore.link, roomStore.currentRoom)
                  .then((res) => {
                    roomStore.currentUser = res
                    console.log(res)
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }
            })
            // 监听新消息
            RemoveNewMessage = NewMessage(linkStore.link, (err, res) => {
              if (err) {
                console.log(err)
                return
              } else {
                console.log(res)
                chatStore.talkRoom.push(res)
              }
            })
          })
          .catch((err) => {
            console.log(err)
          })
      } else {
        roomStore.currentUser = []
        RemoveUser_left
      }
    }
  )
  // 新增私聊方法
  const startPrivateChat = (data) => {
    chatStore.user.push(data.username)

    console.log('开启私聊:', { targetSocketId: data.id })
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
              @click="startPrivateChat(data)"
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
