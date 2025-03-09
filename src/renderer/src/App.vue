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
      self_name.value = data.name
      self_id.value = data.id
    })
  }
  // 连接用户
  const connect_user = () => {
    if (name.value === '') {
      alert('请输入用户名')
      return
    } else {
      Default_Send(link, name.value)
    }
  }
  // 传输本地视频流
  const getVideo = async () => {
    video_self.value.srcObject = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1280, height: 720, frameRate: 60 },
      audio: true
    })
    AddStream(link, video_self.value.srcObject)
    //触发接受流事件
    GetStream(link, video_remote.value.srcObject)
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
    <br />
    <input v-model="name" type="text" placeholder="用户名" />
    <button @click="connect_user">连接用户</button>
    <br />
    <button @click="getVideo">传输本地视频流</button>
    <br />
    <video ref="video_self" autoplay></video>
    <br />
    <video ref="video_remote" autoplay></video>
  </div>
</template>
