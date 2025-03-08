<script setup>
import { ref } from 'vue'
import { createLink } from './socket/user'
import { initialization, GetState, AddStream } from './utility/webrtc'

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
link01.on('webrtc-offer', async (offer) => {
  try {
    const pc = initialization('stun')
    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    link01.emit('webrtc-answer', answer)
  } catch (e) {
    console.error('应答处理失败:', e)
  }
})
link01.on('webrtc-answer', (answer) => {
  pc.setRemoteDescription(answer)
})

link01.on('webrtc-candidate', (candidate) => {
  pc.addIceCandidate(new RTCIceCandidate(candidate))
})
//视频
async function GetVideo() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 60, max: 120 },
        // 修正码率设置方式
        bitrate: {
          ideal: 8_000_000,
          min: 4_000_000,
          max: 16_000_000
        }
      }
    })
    return stream
  } catch (e) {
    console.error('媒体流获取失败:', e)
    throw e // 抛出错误供上层处理
  }
}
// 在 script setup 顶部添加状态声明
const state = ref('等待连接')
let pc = null // 用于保存连接实例

const init = async () => {
  try {
    pc = initialization('stun')
  } catch (error) {
    throw new Error('初始化失败: ' + error.message)
  }
}

const initConnection = async () => {
  try {
    console.log('开始连接')
    init()
    const stream = await GetVideo()
    AddStream(pc, stream)
    state.value = GetState(pc)
  } catch (error) {
    state.value = '连接失败'
    console.error('连接错误:', error)
  }
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
  <div>连接状态: {{ state }}</div>
  <button @click="initConnection">建立连接</button>
</template>
