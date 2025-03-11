import { io } from 'socket.io-client'
import { initialization } from '../utility/webrtc'
/**
 * 创建链接
 * @param {socket address} ip
 * @param {stun/turn} type
 * @returns socket与webrtc的复合对象
 */
export async function createLink(url, type) {
  try {
    const serverUrl = `http://${url}`

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
export async function Default_Send(douLink, name) {
  await douLink.rtc_link
    .createOffer()
    .then((offer) => {
      douLink.rtc_link.setLocalDescription(offer).then(() => {
        // 修改 offer.toJSON() 为手动转换
        douLink.socket_link.emit('offer', {
          name: name,
          offer: {
            sdp: offer.sdp,
            type: offer.type
          }
        })
        IceCandidate_event(douLink, name, null)
      })
    })
    .catch((error) => {
      console.error('Offer 创建失败:', error)
    })
}
/**
 * 接收offer
 * @param {复合对象} douLink
 */
function offer_get(douLink) {
  douLink.socket_link.on('offer_get', (data) => {
    const offer = new RTCSessionDescription(data.offer)
    douLink.rtc_link
      .setRemoteDescription(offer)
      .then(() => {
        douLink.rtc_link.createAnswer().then((answer) => {
          douLink.rtc_link.setLocalDescription(answer)
          // 修改 answer.toJSON() 为手动转换
          douLink.socket_link.emit('answer', {
            id: data.id,
            answer: {
              sdp: answer.sdp,
              type: answer.type
            }
          })
          IceCandidate_event(douLink, null, data.id)
        })
      })
      .catch((error) => {
        console.error('解析offer与发送answer 设置失败:', error)
      })
  })
}
/**
 * 接收answer
 * @param {复合对象} douLink
 */
function answer_get(douLink) {
  douLink.socket_link.on('answer_get', (data) => {
    const answer = new RTCSessionDescription(data.answer)
    douLink.rtc_link.setRemoteDescription(answer)
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
        candidate: event.candidate.toJSON(),
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
  douLink.socket_link.on('remote-icecandidate', (precandidate) => {
    const candidate = new RTCIceCandidate(precandidate)
    douLink.rtc_link.addIceCandidate(candidate)
  })
}
/**
 * 增加数据流
 * @param {复合对象} douLink
 * @param {视频流} stream
 */
export function AddStream(douLink, stream) {
  try {
    stream.getTracks().forEach((track) => {
      douLink.rtc_link.addTrack(track, stream)
    })
    console.log('添加视频流成功')
  } catch (error) {
    console.error('添加视频流失败:', error)
  }
}

/**
 * 获取数据流
 * @param {复合对象} douLink
 * @returns 接受的数据流
 */
export function GetStream(douLink) {
  return new Promise((resolve, reject) => {
    // 添加超时处理
    const timeoutId = setTimeout(() => {
      reject(new Error('等待视频流超时（5秒）'))
    }, 5000)

    // 使用箭头函数保持 this 指向
    const trackHandler = (event) => {
      if (event.streams?.length > 0) {
        clearTimeout(timeoutId)
        try {
          resolve(event.streams[0])
          // 移除监听器避免内存泄漏
          douLink.rtc_link.removeEventListener('track', trackHandler)
        } catch (err) {
          console.error('视频流处理失败:', err)
          reject(err)
        }
      }
    }

    // 使用标准事件监听接口
    douLink.rtc_link.addEventListener('track', trackHandler)
  })
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
