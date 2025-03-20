import { io } from 'socket.io-client'
import { initialization } from '../utility/webrtc'
/**
 * 创建 WebSocket 与 WebRTC 的复合连接
 * @param {string} url - WebSocket 服务器地址 (格式: "ip:port")
 * @param {string} type - STUN/TURN 服务器类型
 * @returns {Promise<Object>} 包含 socket_link 和 rtc_link 的复合连接对象
 */
export async function createLink(url, type) {
  try {
    const serverUrl = `ws://${url}`

    const socket_link = await io(serverUrl, {
      transports: ['websocket'],
      autoConnect: false, // 关闭自动连接
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    })
    // 添加连接等待逻辑
    await new Promise((resolve, reject) => {
      socket_link.once('connect', resolve)
      socket_link.once('connect_error', (err) => {
        reject(new Error(`Socket连接失败: ${err.message}`))
      })
      socket_link.connect() // 手动触发连接
    })

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
 * 主动发送 WebRTC offer 到指定用户
 * @param {Object} douLink - 复合连接对象
 * @param {string} name - 目标用户名
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
 * 处理远端发来的 offer 请求
 * @param {Object} douLink - 复合连接对象
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
 * @param {Object} douLink - 复合连接对象
 */
function answer_get(douLink) {
  douLink.socket_link.on('answer_get', (data) => {
    const answer = new RTCSessionDescription(data.answer)
    douLink.rtc_link.setRemoteDescription(answer)
  })
}
/**
 * 发送 ICE 候选信息
 * @param {Object} douLink - 复合连接对象
 * @param {string|null} name - 目标用户名（主动发起时使用）
 * @param {string|null} id - 目标连接ID（被动响应时使用）
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
 * @param {Object} douLink - 复合连接对象
 */
function icecandidate_get(douLink) {
  douLink.socket_link.on('remote-icecandidate', (precandidate) => {
    const candidate = new RTCIceCandidate(precandidate)
    douLink.rtc_link.addIceCandidate(candidate)
  })
}
/**
 * 增加数据流
 * @param {Object} douLink - 复合连接对象
 * @param {stream} stream - 数据流
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
 * @param {Object} douLink - 复合连接对象
 * @returns {stream} - 接受的数据流
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
 * @param {Object} douLink - 复合连接对象
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
/**
 * 注册
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 注册数据
 * @returns {Promise} 注册结果
 */
export function Register(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('register', data)
    douLink.socket_link.once('register', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res)
    })
  })
}
/**
 * 登录
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 登录数据
 * @returns {Promise} 登录结果
 */
export function Login(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('login', data)
    douLink.socket_link.once('login', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res)
    })
  })
}

/**
 * 创建验证码
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 需要验证的数据
 * @returns {Promise<Object>} 结果
 */
export function CreateValid(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('createValid', data)
    douLink.socket_link.once('createValid', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res)
    })
  })
}
/**
 * 获取所有用户
 * @param {Object} douLink - 复合连接对象
 * @returns {Promise<Object>} 结果
 */
export function GetAll(douLink) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('getAll')
    douLink.socket_link.once('getAll', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res)
    })
  })
}
/**
 * 实时监听在线用户列表变化
 * @param {Object} douLink - 包含 socket 和 WebRTC 连接的复合对象
 * @param {Function} callback - 接收更新的回调函数（错误优先模式）
 * @returns {Function} 取消监听的清理函数
 */
export function OnlineUsers(douLink, callback) {
  // 添加回调参数
  const handler = (res) => {
    if (res.error) {
      callback(res.error, null)
    } else {
      callback(null, res)
    }
  }
  // 注册持久监听
  douLink.socket_link.on('onlineUsers', handler)
  // 返回取消监听的方法
  return () => {
    douLink.socket_link.off('onlineUsers', handler)
  }
}
/**
 * 获取当前在线用户列表
 * @param {Object} douLink - 包含 socket 和 WebRTC 连接的复合对象
 * @returns {Promise<Object>} 返回包含在线用户数据的 Promise 对象
 */
export function GetOnlineUsers(douLink) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('onlineUsers')
    douLink.socket_link.once('onlineUsers', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res)
    })
  })
}
