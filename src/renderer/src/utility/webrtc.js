import config from '../../../config/TM_config.json'
/**
 * 初始化 WebRTC 连接
 * @param {string} type - 服务器类型 ('stun' 或 'turn')
 * @returns {Promise<RTCPeerConnection>} 初始化的 WebRTC 连接实例
 */
export async function initialization(type) {
  try {
    const iceconfig = iceServers(config, type)
    const pc = new RTCPeerConnection(config)
    console.log('ICE 服务器配置:', iceconfig)
    return pc
  } catch (error) {
    console.error('RTC初始化失败:', error)
    throw error
  }
}
/**
 * 为 WebRTC 连接添加媒体流
 * @param {RTCPeerConnection} pc - WebRTC 连接实例
 * @param {MediaStream} stream - 需要添加的媒体流
 */
export function AddStream(pc, stream) {
  for (const track of stream.getTracks()) {
    pc.addTrack(track, stream)
  }
  console.log(pc)
}
/**
 * 生成 ICE 服务器配置
 * @param {Object} config - 基础配置信息
 * @param {string} type - 服务器类型 ('stun' 或 'turn')
 * @returns {RTCConfiguration} 包含 ICE 服务器和传输策略的配置对象
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
 * 获取 WebRTC 连接状态信息
 * @param {RTCPeerConnection} pc - WebRTC 连接实例
 * @returns {Promise<Object>} 包含以下属性的状态对象：
 *   - iceState: ICE 连接状态
 *   - connectionState: 整体连接状态
 *   - remoteIP: 远程 IP 地址（逗号分隔）
 *   - localIP: 本地 IP 地址（逗号分隔）
 *   - protocol: 使用的协议类型
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

/* ICE 连接状态说明：
new        - 初始状态，无连接活动
connecting - 正在建立连接
connected  - 至少有一个连接成功
disconnected - 部分连接断开
failed     - 所有连接尝试失败
closed     - 连接已完全关闭 */
