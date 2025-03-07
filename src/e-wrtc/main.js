import wrtc from 'wrtc'
import config from '../TM_config.json'
import logger from '../log/logger'

// 初始化WebRTC模块
const { RTCPeerConnection, RTCSessionDescription } = wrtc

// 添加WebRTC全局对象
global.RTCPeerConnection = RTCPeerConnection
global.RTCSessionDescription = RTCSessionDescription

/**
 *  初始化
 * @param {网络类型} type
 * @param {视频流} stream
 */
export async function initialization(type, stream) {
  const pc = new RTCPeerConnection(initialization_iceServers(config, type))

  // 添加本地媒体轨道
  stream.getTracks().forEach((track) => pc.addTrack(track, stream))

  // 调试日志
  logger.debug('ICE服务器配置:', initialization_iceServers(config, type))
  pc.addEventListener('icegatheringstatechange', () =>
    logger.debug(`ICE收集状态: ${pc.iceGatheringState}`)
  )

  // 创建Offer
  pc.createOffer()
    .then((offer) => {
      logger.debug('生成原始Offer:', offer.sdp) // 打印完整SDP
      return pc.setLocalDescription(offer)
    })
    .catch((err) => logger.error('创建Offer失败:', err))

  // 1. 候选地址跟踪
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      logger.info('发现候选地址:', {
        protocol: candidate.protocol, // 协议类型：udp/tcp
        type: candidate.type, // 候选类型：host/srflx/relay
        address: candidate.address, // 公网IP地址
        port: candidate.port, // 映射端口
        foundation: candidate.foundation // 唯一标识符
      })
    }
  }
  // 2. 连接状态跟踪
  pc.oniceconnectionstatechange = () => {
    logger.info('ICE状态变更:', pc.iceConnectionState) // connected/disconnected/failed
  }

  // 3. 最终连接信息（连接建立后）
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'connected') {
      logger.info('最终连接参数:', {
        localIP: pc.localDescription.sdp.match(/a=candidate:.+ (\d+\.\d+\.\d+\.\d+)/)?.[1],
        remoteIP: pc.remoteDescription.sdp.match(/a=candidate:.+ (\d+\.\d+\.\d+\.\d+)/)?.[1],
        protocol: pc.getConfiguration().iceTransportPolicy
      })
    }
  }
}

/**
 * 配置文件读取
 * @param {配置文件} config
 * @param {协议类型} type
 * @returns
 */
function initialization_iceServers(config, type) {
  let iceServers // 在函数作用域顶部声明变量

  if (type === 'stun') {
    iceServers = config.network.iceServers[0]
  } else if (type === 'turn') {
    iceServers = config.network.iceServers[1]
  }
  return { iceServers: [iceServers] } // 返回标准结构
}
