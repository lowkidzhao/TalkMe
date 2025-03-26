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
    iceServers: [config.network.iceServers[type === 'turn' ? 1 : 0]],
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
  // 添加参数校验
  if (!(pc instanceof RTCPeerConnection)) {
    console.log('无效的 WebRTC 连接实例:', pc)
    return '无效的 WebRTC 连接实例'
  }

  const connectionInfo = {
    iceState: pc.iceConnectionState,
    connectionState: pc.connectionState || 'unknown',
    remoteIP: new Set(),
    localIP: new Set(),
    protocol: new Set(),
    transportState: pc.iceTransport?.state || 'unavailable'
  }

  try {
    const stats = await pc.getStats()

    stats.forEach((report) => {
      // 新增 candidate-pair 类型检测
      if (report.type === 'candidate-pair' && report.selected) {
        connectionInfo.currentProtocol = report.protocol.toLowerCase()
      }

      // 优化 IP 地址收集逻辑
      if (report.type === 'transport') {
        connectionInfo.localIP.add(report.localAddress)
        connectionInfo.remoteIP.add(report.remoteAddress)
      }

      // 保留原有候选收集逻辑
      if (report.type === 'local-candidate') {
        connectionInfo.localIP.add(report.ip || report.address)
        connectionInfo.protocol.add(report.protocol.toLowerCase())
      }
      if (report.type === 'remote-candidate') {
        connectionInfo.remoteIP.add(report.ip || report.address)
      }
    })

    return {
      ...connectionInfo,
      // 增加实时状态指标
      isConnected: ['connected', 'completed'].includes(pc.iceConnectionState),
      remoteIP: Array.from(connectionInfo.remoteIP).join(', ') || 'N/A',
      localIP: Array.from(connectionInfo.localIP).join(', ') || 'N/A',
      protocol: Array.from(connectionInfo.protocol).join('/') || 'N/A'
    }
  } catch (error) {
    console.error('获取状态失败:', error)
    return {
      ...connectionInfo,
      error: 'STATS_FETCH_FAILED',
      message: error.message
    }
  }
}
/* 
WebRTC ICE 连接状态说明：
new         - 初始状态，尚未开始任何网络连接
checking    - 正在检测候选地址，但未建立有效连接
connected   - 至少发现一个可用的候选地址对，媒体流可传输
completed   - ICE 代理已完成候选地址收集，并建立稳定连接
disconnected- 活动候选地址对失效，但可能自动恢复连接
failed      - 所有候选地址尝试失败且无法自动恢复
closed      - ICE 代理已终止，连接不可复用
*/
