<script setup>
import { ref } from 'vue'
import { io } from 'socket.io-client'

const usercount = ref(0)

const user01 = io('http://localhost:3000')

user01.on('connect', () => {
  console.log('连接成功')
})

user01.on('user-count', (count) => {
  usercount.value = count
})
const GetCounter = () => {
  user01.emit('getCounter')
}

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <div>hello</div>
  <button @click="ipcHandle">点击通信</button>
  <br />
  <div>{{ usercount }}</div>
  <button @click="GetCounter">获取链接数量</button>
</template>
