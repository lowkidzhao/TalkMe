import config from '../../../config/TM_config.json'
/**
 *  初始化
 * @param {网络类型} type
 */
export function initialization(type) {
  const pc = new RTCPeerConnection(iceServers(config, type))
  return pc
}
/**
 * 添加视频流
 * @param {实例} pc
 * @param {视频流} stream
 */
export function AddStream(pc, stream) {
  for (const track of stream.getTracks()) {
    pc.addTrack(track, stream)
  }
  console.log(pc)
}
/**
 * 配置文件读取
 * @param {配置文件} config
 * @param {协议类型} type
 * @returns
 */
function iceServers(config, type) {
  let iceServers // 在函数作用域顶部声明变量

  if (type === 'stun') {
    iceServers = config.network.iceServers[0]
  } else if (type === 'turn') {
    iceServers = config.network.iceServers[1]
  }
  return { iceServers: [iceServers] } // 返回标准结构
}

/**
 * 获取状态
 * @param {实例} pc
 * @returns 字符串
 */
export async function GetState(pc) {
  let connectionInfo = {
    state: pc.connectionState,
    remoteIP: '',
    localIP: '',
    protocol: ''
  }
  // 添加状态转换逻辑
  if (pc.iceConnectionState) {
    connectionInfo.state = pc.iceConnectionState
  }

  return connectionInfo
}

// new
// 表示至少有一个 ICE 连接（RTCIceTransport 或 RTCDtlsTransport 对象）处于 new 状态，并且没有连接处于以下状态： connecting、checking、failed、disconnected，或者这些连接都处于 closed 状态。

// connecting
// 表示至少有一个 ICE 连接处于正在建立连接的状态；也就是说，它们的 iceConnectionState 值为 checking 或 connected，并且没有连接处于 failed 状态。

// connected
// 表示每一个 ICE 连接要么正在使用（connected 或 completed 状态），要么已被关闭（closed 状态）；并且，至少有一个连接处于 connected 或 completed 状态。

// disconnected
// 表示至少有一个 ICE 连接处于 disconnected 状态，并且没有连接处于 failed、connecting 或 checking 状态。

// failed
// 表示至少有一个 ICE 连接处于 failed 的状态。

// closed
// 表示 RTCPeerConnection 已关闭。
