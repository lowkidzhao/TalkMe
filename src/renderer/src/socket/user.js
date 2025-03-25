import { io } from 'socket.io-client'
import { initialization } from '../utility/webrtc'

let RemoveOfferGet = () => {}
let RemoveAnswerGet = () => {}
let RemoveIcecandidateGet = () => {}
/**
 * 处理 ICE 候选事件
 * @param {Object} douLink - 复合连接对象
 * @param {string} name - 目标用户名
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
    RemoveOfferGet = offer_get(douLink)
    RemoveAnswerGet = answer_get(douLink)
    RemoveIcecandidateGet = icecandidate_get(douLink)
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
 * @param {Object} douLink - 复合连接对象，包含 socket_link 和 rtc_link
 * @returns {Function} 返回一个函数，用于移除事件监听器
 * @description 该函数用于处理远端发来的 offer 请求，包括设置远程 offer、创建并发送 answer，
 *              以及处理 ICE 候选信息。返回的函数可用于在不需要时移除事件监听器，避免内存泄漏。
 */
function offer_get(douLink) {
  const handler = (data) => {
    const offer = new RTCSessionDescription(data.offer)
    douLink.rtc_link
      .setRemoteDescription(offer)
      .then(() => {
        douLink.rtc_link.createAnswer().then((answer) => {
          douLink.rtc_link.setLocalDescription(answer)
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
  }
  douLink.socket_link.on('offer_get', handler)
  // 返回一个函数用于移除事件监听器
  return () => {
    douLink.socket_link.off('offer_get', handler)
  }
}
/**
 * 接收answer
 * @param {Object} douLink - 复合连接对象
 * @returns {Function} 用于移除事件监听器的函数
 */
function answer_get(douLink) {
  const handler = (data) => {
    const answer = new RTCSessionDescription(data.answer)
    douLink.rtc_link.setRemoteDescription(answer)
  }
  douLink.socket_link.on('answer_get', handler)
  // 返回一个函数用于移除事件监听器
  return () => {
    douLink.socket_link.off('answer_get', handler)
  }
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
 * @param {Object} douLink - 复合连接对象，包含 socket_link 和 rtc_link
 * @returns {Function} 返回一个函数，用于移除事件监听器
 * @description 该函数用于处理远端发来的 ICE 候选信息，将其添加到本地 RTCPeerConnection 中。
 *              返回的函数可用于在不需要时移除事件监听器，避免内存泄漏。
 */
function icecandidate_get(douLink) {
  const handler = (precandidate) => {
    const candidate = new RTCIceCandidate(precandidate)
    douLink.rtc_link.addIceCandidate(candidate)
  }
  douLink.socket_link.on('remote-icecandidate', handler)
  // 返回一个函数用于移除事件监听器
  return () => {
    douLink.socket_link.off('remote-icecandidate', handler)
  }
}
/**
 * 增加数据流
 * @param {Object} douLink - 复合连接对象
 * @param {stream} stream - 数据流
 */
export function AddStream(douLink, stream) {
  try {
    //清空之前的音频流
    const senders = douLink.rtc_link.getSenders()
    senders.forEach((sender) => douLink.rtc_link.removeTrack(sender))

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
/**
 * 断开连接
 * @param {Object} douLink - 包含 socket 和 WebRTC 连接的复合对象
 */
export function closeLink(douLink) {
  if (douLink) {
    // 移除事件监听器
    RemoveOfferGet()
    RemoveAnswerGet()
    RemoveIcecandidateGet()
    // 关闭 WebSocket 连接
    if (douLink.socket_link?.connected) {
      douLink.socket_link.disconnect()
    }
    // 关闭 WebRTC 连接
    if (douLink.rtc_link) {
      douLink.rtc_link.close()
    }
  }
}

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
/**
 * 获取所有房间信息
 * @param {Object} douLink - 复合连接对象
 * @returns {Promise<Object>} 包含房间列表的结果
 */
export function GetRoom(douLink) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('getAllroom')
    douLink.socket_link.once('getAllroom', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res)
    })
  })
}

/**
 * 创建新房间
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 房间数据
 * @returns {Promise<Object>} 创建结果
 */
export function NewRoom(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('newroom', data)
    douLink.socket_link.once('newroom', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res.success)
    })
  })
}

/**
 * 删除房间
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 要删除的房间数据
 * @returns {Promise<Object>} 删除结果
 */
export function DeleteRoom(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('deleteroom', data)
    douLink.socket_link.once('deleteroom', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res)
    })
  })
}

/**
 * 加入房间
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 要加入的房间数据
 * @returns {Promise<Object>} 加入结果
 */
export function JoinRoom(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('joinroom', data)
    douLink.socket_link.once('joinroom', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res.success)
    })
  })
}

/**
 * 离开房间（自动检测并离开）
 * @param {Object} douLink - 复合连接对象
 * @returns {Promise<Object>} 离开结果
 */
export function LeaveRoom(douLink) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('leaveroom')
    douLink.socket_link.once('leaveroom', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res.success)
    })
  })
}

/**
 * 发送消息
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 消息数据
 * @returns {Promise<Object>} 发送结果
 */
export function Message(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('message', data)
    douLink.socket_link.once('message', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res.success)
    })
  })
}

/**
 * 监听新消息
 * @param {Object} douLink - 复合连接对象
 * @param {Function} callback - 接收消息的回调函数（错误优先模式）
 * @returns {Function} 取消监听的清理函数
 */
export function NewMessage(douLink, callback) {
  const handler = (res) => {
    if (res.error) {
      callback(res.error, null)
    } else {
      callback(null, res)
    }
  }
  douLink.socket_link.on('newmessage', handler)
  return () => {
    douLink.socket_link.off('newmessage', handler)
  }
}
/**
 * 获取历史消息
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 包含 roomId 的对象
 * @returns {Promise<Object>} 包含历史消息的结果
 */
export function GetMessage(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('getMessages', data)
    douLink.socket_link.once('getMessages', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res.success)
    })
  })
}

/**
 * 监听用户离开事件
 * @param {Object} douLink - 复合连接对象
 * @param {Function} callback - 接收离开通知的回调函数（错误优先模式）
 * @returns {Function} 取消监听的清理函数
 */
export function User_left(douLink, callback) {
  const handler = (res) => {
    if (res.error) {
      callback(res.error, null)
    } else {
      callback(null, res.success)
    }
  }
  douLink.socket_link.on('user_left', handler)
  return () => {
    douLink.socket_link.off('user_left', handler)
  }
}
/**
 * 监听用户加入事件
 * @param {Object} douLink - 复合连接对象
 * @param {Function} callback - 接收加入通知的回调函数（错误优先模式）
 * @returns {Function} 取消监听的清理函数
 */
export function User_join(douLink, callback) {
  const handler = (res) => {
    if (res.error) {
      callback(res.error, null)
    } else {
      callback(null, res.success)
    }
  }
  douLink.socket_link.on('user_joined', handler)
  return () => {
    douLink.socket_link.off('user_joined', handler)
  }
}
/**
 * 获取当前房间内的用户列表
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 包含 roomId 的对象
 * @returns {Promise<Object>} 包含房间用户列表的结果
 */
export function GetRoomUser(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('getRoomUsers', data)
    douLink.socket_link.once('getRoomUsers', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res.success)
    })
  })
}
/**
 * 发送新私聊消息
 * @param {Object} douLink - 复合连接对象
 * @param {Object} data - 包含 name 的对象
 * @returns {Promise<Object>} 结果
 */
export function PrivateMessage(douLink, data) {
  return new Promise((resolve, reject) => {
    douLink.socket_link.emit('privateMessage', data)
    douLink.socket_link.once('privateMessage', (res) => {
      if (res.error) {
        reject(res.error)
      }
      resolve(res.success)
    })
  })
}
/**
 * 监听用户私聊事件
 * @param {Object} douLink - 复合连接对象
 * @param {Function} callback - 接收私聊通知的回调函数（错误优先模式）
 * @returns {Function} 取消监听的清理函数
 */
export function GetPrivateMessage(douLink, callback) {
  const handler = (res) => {
    if (res.error) {
      callback(res.error, null)
    } else {
      callback(null, res.success)
    }
  }
  douLink.socket_link.on('getPrivateMessage', handler)
  return () => {
    douLink.socket_link.off('getPrivateMessage', handler)
  }
}
