<script setup>
  import { ref } from 'vue'
  import { initialization } from './utility/webrtc.js'
  import { createLink } from './socket/user.js'

  const videoB = ref(null)
  const videoA = ref(null)
  let A_socket = null
  let B_socket = null
  let A_pc = null
  let B_pc = null
  const startSocket = async () => {
    A_socket = await createLink('localhost:3000')
    setTimeout(() => {}, 100)
    B_socket = await createLink('localhost:3000')
  }
  const startWrtc = async () => {
    A_pc = await initialization('stun')
    B_pc = await initialization('stun')
    //获取A的流
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    videoA.value.srcObject = stream
    //处理AB交互
    await exchangeSDP(stream)
    B_pc.ontrack = (event) => {
      videoB.value.srcObject = event.streams[0]
    }
  }
  //交换SDP
  async function exchangeSDP(stream) {
    //将A的流添加到A的pc中
    stream.getTracks().forEach((track) => {
      A_pc.addTrack(track, stream)
    })
    //生成ICE候选
    A_pc.onicecandidate = (event) => {
      if (event.candidate) {
        A_socket.emit('toB_candidate', event.candidate)
      }
    }
    //获取B的ICE
    A_socket.on('getB_candidate', (candidate) => {
      A_pc.addIceCandidate(candidate)
    })
    //获取B的ICE
    A_socket.on('getB_candidate', (candidate) => {
      A_pc.addIceCandidate(candidate)
    })
    //A向B发送offer
    A_pc.createOffer().then((offer) => {
      A_pc.setLocalDescription(offer)
      A_socket.emit('offer', offer)
    })
    //收到B的answer
    A_socket.on('toA', (answer) => {
      A_pc.setRemoteDescription(answer)
    })
    //收到A的offer
    B_socket.on('toB', (offer) => {
      //添加远程地址
      B_pc.setRemoteDescription(offer)
      //生成answer
      B_pc.createAnswer().then((answer) => {
        //添加本地地址
        B_pc.setLocalDescription(answer)
        B_socket.emit('answer', answer)
      })
    })
    //生成B的ICE
    B_pc.onicecandidate = (event) => {
      if (event.candidate) {
        B_socket.emit('toA_candidate', event.candidate)
      }
    }
    //B收到A的ICE
    B_socket.on('getA_candidate', (candidate) => {
      B_pc.addIceCandidate(candidate)
    })
  }
</script>

<template>
  <div class="container">
    <h3>双用户连接模拟 (同一信令服务器)</h3>
    <div>
      <span>A</span>
      <button @click="startSocket">创建连接</button>
      <button @click="startWrtc">开始</button>
      <video
        ref="videoA"
        autoplay
        muted
        controls
        class="video-preview"
        style="width: 100%; max-width: 600px"
      ></video>
    </div>
    <div>
      <span>B</span>
      <video
        ref="videoB"
        autoplay
        muted
        controls
        class="video-preview"
        style="width: 100%; max-width: 600px"
      ></video>
    </div>
  </div>
</template>

<!-- 样式保持不变 -->
