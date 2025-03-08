<script setup>
import { ref } from 'vue'
import { createLink } from './socket/user'

const usercount = ref(0)
const link01 = createLink('localhost:3000')
link01.on('connect', () => {
  console.log('连接成功')
})
link01.on('user-count', (count) => {
  usercount.value = count
})
const GetCounter = () => {
  link01.emit('getCounter')
}

//视频
const GetVideo = () => {
  const video = document.querySelector('video')
  navigator.mediaDevices
    .getDisplayMedia({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 60, max: 120 },
        bitrate: {
          // 新增码率控制
          ideal: 8_000_000, // 8 Mbps (蓝光级)
          min: 4_000_000, // 4 Mbps (高清最低)
          max: 16_000_000 // 16 Mbps (4K级)
        }
      }
    })
    .then((stream) => {
      video.srcObject = stream
      video.onloadedmetadata = () => video.play()
    })
    .catch((e) => console.log(e))
}

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <div>hello</div>
  <button @click="ipcHandle">点击通信</button>
  <br />
  <div>{{ usercount }}</div>
  <button @click="GetCounter">获取链接数量</button>
  <br />
  <button @click="GetVideo">获取视频</button>
  <video autoplay controls muted style="object-fit: contain; background: #000"></video>
</template>
