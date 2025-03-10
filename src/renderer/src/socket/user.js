import { io } from 'socket.io-client'
import { initialization } from '../utility/webrtc'
/**
 * 创建链接
 * @param {socket address} ip
 * @param {stun/turn} type
 * @returns socket与webrtc的复合对象
 */
export async function createLink(ip, type) {
  try {
    // 生产环境特殊处理
    const isProduction = process.env.NODE_ENV === 'production'

    // 修正文件协议问题
    const serverUrl = isProduction
      ? 'http://' + ip // 生产环境使用固定端口
      : 'http://localhost:' + ip // 开发环境保持原样

    const socket_link = await io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    })
    socket_link.on('connect', () => console.log('Socket connected'))
    socket_link.on('connect_error', (err) => console.log('Socket error:', err))

    const rtc_link = await initialization(socket_link, type)
    // 添加 ICE 状态监听
    rtc_link.oniceconnectionstatechange = () =>
      console.log('ICE 连接状态:', rtc_link.iceConnectionState)

    const douLink = { socket_link, rtc_link }
    offer_get(douLink)
    answer_get(douLink)
    icecandidate_get(douLink)
    return douLink
  } catch (error) {
    console.log('服务器连接出错： ' + error)
    throw error
  }
}
/**
 * 指定发送offer
 * @param {复合对象} douLink
 * @param {目标名字} name
 */
export function Default_Send(douLink, name) {
  douLink.rtc_link.createOffer().then((offer) => {
    douLink.rtc_link.setLocalDescription(offer)
    douLink.socket_link.emit('offer', { name: name, content: offer })
    IceCandidate_event(douLink, name, null)
  })
}
/**
 * 接收offer
 * @param {复合对象} douLink
 */
function offer_get(douLink) {
  douLink.socket_link.on('offer_get', (data) => {
    douLink.rtc_link.setRemoteDescription(data.offer)
    douLink.rtc_link.createAnswer().then((answer) => {
      douLink.rtc_link.setLocalDescription(answer)
      //重复利用
      douLink.socket_link.emit('answer', { id: data.id, answer: answer })
      IceCandidate_event(douLink, null, data.id)
    })
  })
}
/**
 * 接收answer
 * @param {复合对象} douLink
 */
function answer_get(douLink) {
  douLink.socket_link.on('answer_get', (data) => {
    douLink.rtc_link.setRemoteDescription(data.answer)
  })
}
/**
 * 发送ice候选
 * @param {复合对象} douLink
 * @param {目标别名} name
 * @param {目标id} id
 */
function IceCandidate_event(douLink, name, id) {
  douLink.rtc_link.onicecandidate = (event) => {
    if (event.candidate) {
      douLink.socket_link.emit('icecandidate', {
        candidate: event.candidate,
        name: name,
        id: id
      })
    }
  }
}
/**
 * 接收ice候选
 * @param {复合对象} douLink
 */
function icecandidate_get(douLink) {
  douLink.socket_link.on('remote-icecandidate', (candidate) => {
    douLink.rtc_link.addIceCandidate(candidate)
  })
}
/**
 * 增加数据流
 * @param {复合对象} douLink
 * @param {视频流} stream
 */
export function AddStream(douLink, stream) {
  douLink.rtc_link.addStream(stream)
}

/**
 * 获取数据流
 * @param {复合对象} douLink
 * @returns 接受的数据流
 */
export function GetStream(douLink) {
  douLink.rtc_link.onTrack = (event) => {
    if (event.streams && event.streams[0]) {
      try {
        return event.streams[0]
      } catch (err) {
        console.error('视频流获取失败:', err)
      }
    }
  }
}

/**
 * 获取用户信息
 * @param {复合对象} douLink
 */
export function GetUserInfo(douLink) {
  return new Promise((resolve) => {
    douLink.socket_link.emit('getUserInfo')
    douLink.socket_link.once('user-info', (name, id) => {
      resolve({ name, id })
    })
  })
}

// /**
//  * 关闭链接
// function close(douLink) {
//   douLink.socket_link.close()
//   douLink.rtc_link.close()
// }
