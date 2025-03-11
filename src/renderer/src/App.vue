<script setup>
  import { ref } from 'vue'
  import { createLink, Default_Send, AddStream, GetStream, GetUserInfo } from './socket/user.js'
  // localhost:3000
  const self_name = ref('')
  const self_id = ref('')
  const target = ref('')
  const type = ref('')
  const name = ref('')
  const video_self = ref(null)
  const video_remote = ref(null)
  let link = null
  // 连接服务器
  const connect_start = async () => {
    if (target.value === '') {
      alert('请输入服务器地址')
      return
    } else if (type.value === '') {
      alert('请输入服务器类型')
      return
    } else {
      link = await createLink(target.value, type.value)
      if (link === null) {
        alert('连接失败')
        return
      }
    }
    alert('连接服务器')
    GetUserInfo(link).then((data) => {
      console.log(data)
      self_name.value = data.name
      self_id.value = data.id
    })
    GetUserInfo(link).then((data) => {
      console.log('02+' + data.name)
      self_name.value = data.name
      self_id.value = data.id
    })
  }
  // 传输本地视频流
  const getVideo = async () => {
    video_self.value.srcObject = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1280, height: 720, frameRate: 60 },
      audio: false
    })
    AddStream(link, video_self.value.srcObject)
  }
  // 接收视频流（需要包裹在函数中）
  const getRemoteVideo = async () => {
    try {
      const stream = await GetStream(link)
      video_remote.value.srcObject = stream // 使用 .value 访问 ref
    } catch (error) {
      console.error('获取视频流失败:', error)
      alert('无法接收远程视频流')
    }
  }
  // 连接用户
  const connect_user = async () => {
    if (name.value === '') {
      alert('请输入用户名')
      return
    }
    try {
      await getVideo()
      await Default_Send(link, name.value)
    } catch (error) {
      console.error('连接用户失败:', error)
      alert('无法连接用户')
    }
  }

  // 在 setup 中添加状态获取方法
  const connectionState = ref('未连接')

  const getState = () => {
    if (!link) {
      alert('请先连接服务器')
      return
    }
    // 方式1：基础状态验证
    const basicState = {
      iceState: link.rtc_link.iceConnectionState,
      signalingState: link.rtc_link.signalingState,
      localIP: [
        ...new Set(
          link.rtc_link
            .getSenders()
            .map((s) => s.transport?.iceTransport?.getLocalParameters()?.usernameFragment)
        )
      ],
      remoteIP: [
        ...new Set(
          link.rtc_link
            .getReceivers()
            .map((r) => r.transport?.iceTransport?.getRemoteParameters()?.usernameFragment)
        )
      ]
    }
    console.log('基础连接状态:', basicState)
  }
</script>

<template>
  <div>
    <span>别名：{{ self_name }}</span>
    <span>ID: {{ self_id }}</span>
    <br />
    <input v-model="target" type="text" placeholder="服务器地址" />
    <input v-model="type" type="text" placeholder="服务器类型" />
    <button @click="connect_start">连接服务器</button>
    <button @click="getState">验证连接状态</button>
    <div>{{ connectionState }}</div>
    <br />
    <input v-model="name" type="text" placeholder="用户名" />
    <button @click="connect_user">连接用户</button>
    <button @click="getRemoteVideo">获取远端视频流</button>
    <br />
    <video ref="video_self" autoplay></video>
    <br />
    <video ref="video_remote" autoplay></video>
  </div>
</template>
