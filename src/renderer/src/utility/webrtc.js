import config from '../../../config/TM_config.json'
/**
 *  初始化
 * @param {网络类型} type
 */
export async function initialization(type) {
  try {
    const pc = await new RTCPeerConnection(iceServers(config, type))
    return pc
  } catch (error) {
    console.error('RTC初始化失败:', error)
    return null
  }
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
  // 在现有配置基础上添加网络约束
  return {
    iceServers: [config.network.iceServers[type === 'stun' ? 0 : 1]],
    iceTransportPolicy: 'all',
    // 新增网络约束
    iceCandidatePoolSize: 5,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  }
}

/**
 * 获取状态
 * @param {实例} pc
 * @returns 字符串
 */
export async function GetState(pc) {
  const connectionInfo = {
    iceState: pc.iceConnectionState,
    connectionState: pc.connectionState,
    remoteIP: new Set(),
    localIP: new Set(),
    protocol: new Set()
  }

  const stats = await pc.getStats()

  stats.forEach((report) => {
    // 解析本地候选
    if (report.type === 'local-candidate') {
      connectionInfo.localIP.add(report.ip || report.address)
      connectionInfo.protocol.add(report.protocol.toLowerCase())
    }
    // 解析远程候选
    if (report.type === 'remote-candidate') {
      connectionInfo.remoteIP.add(report.ip || report.address)
    }
  })

  return {
    ...connectionInfo,
    remoteIP: Array.from(connectionInfo.remoteIP).join(', ') || 'N/A',
    localIP: Array.from(connectionInfo.localIP).join(', ') || 'N/A',
    protocol: Array.from(connectionInfo.protocol).join('/') || 'N/A'
  }
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
