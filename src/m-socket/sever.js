import { Server } from 'socket.io'
import logger from '../log/logger'

/**
 * 创建服务器
 * @param {服务器端口} port
 * @returns {服务器实例}
 */
export function createServer(port) {
  const io = new Server(port, {
    cors: {
      origin: 'http://localhost:5173', // 必须与渲染进程源完全一致
      methods: ['GET', 'POST', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    // 新增性能优化配置
    transports: ['websocket'], // 强制使用WebSocket传输
    allowEIO3: true, // 兼容旧版客户端
    pingTimeout: 50000, // 保持长连接
    pingInterval: 15000, // 减少心跳频率
    maxHttpBufferSize: 1e8 // 增大缓冲区适应音频流
  })
  // 在io实例创建后添加
  io.on('listening', () => {
    logger.info(`Socket.IO服务已启动在端口:${io.httpServer.address().port}`)
  })

  io.on('error', (err) => {
    logger.error('Socket.IO服务启动失败:', err)
  })
  return io
}

/**
 * 获取用户数量
 * @param {服务器实例} io
 */
export function getServer(io) {
  io.on('connection', (socket) => {
    logger.info('a user connected__' + socket.id)

    socket.on('getCounter', () => {
      console.log('getCounter')

      io.emit('user-count', io.engine.clientsCount)
    })
  })
}
