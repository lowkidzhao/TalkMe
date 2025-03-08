<script setup>
import { ref } from 'vue'
import { initialization } from './utility/webrtc.js'
import { createLink } from './socket/user.js'

// 用户类型常量
const PEER_TYPES = ['A', 'B']

// 状态管理
const peers = ref({
  A: {
    pc: null,
    status: '等待连接',
    stream: null,
    link: createLink('localhost:3000')
  },
  B: {
    pc: null,
    status: '等待连接',
    stream: null,
    link: createLink('localhost:3000') // 使用同一信令服务器
  }
})

// 初始化PeerConnection
const initPeerConnection = async (type) => {
  const pc = initialization('stun')
  const link = peers.value[type].link

  // ICE候选处理
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      link.emit('ice-candidate', {
        candidate,
        target: type === 'A' ? 'B' : 'A'
      })
    }
  }

  // 状态跟踪
  pc.oniceconnectionstatechange = () => {
    peers.value[type].status = pc.iceConnectionState
  }

  // 媒体处理
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1280, height: 720 },
      audio: true
    })
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))
    peers.value[type].stream = stream
  } catch (e) {
    console.error(`[${type}] 媒体捕获失败:`, e)
    throw e
  }

  // 信令处理
  link
    .on('offer', async ({ offer }) => {
      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      link.emit('answer', { answer, from: type })
    })
    .on('answer', async ({ answer }) => {
      await pc.setRemoteDescription(answer)
    })
    .on('ice-candidate', async ({ candidate }) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

  return pc
}

// 连接控制
const handleConnect = async (type) => {
  try {
    if (!peers.value[type].pc) {
      peers.value[type].pc = await initPeerConnection(type)
    }

    const pc = peers.value[type].pc
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    peers.value[type].link.emit('offer', {
      offer,
      target: type === 'A' ? 'B' : 'A'
    })
  } catch (e) {
    console.error(`[${type}] 连接失败:`, e)
    peers.value[type].status = '连接失败'
  }
}
</script>

<template>
  <div class="container">
    <h3>双用户连接模拟 (同一信令服务器)</h3>
    <div v-for="t in PEER_TYPES" :key="t" class="user-panel">
      <button @click="handleConnect(t)">用户 {{ t }} 发起连接</button>
      <div>状态: {{ peers[t].status }}</div>
      <video v-if="peers[t].stream" :srcObject.prop="peers[t].stream" autoplay muted playsinline
        class="video-output"></video>
    </div>
  </div>
</template>

<!-- 样式保持不变 -->
