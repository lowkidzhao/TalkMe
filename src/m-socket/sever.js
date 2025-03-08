import { Server } from 'socket.io'
import logger from '../log/logger'

/**
 * 创建服务器
 * @param {服务器端口} port
 * @returns {服务器实例}
 */
export function createServer(port) {
  try {
    // 创建时不要立即绑定端口
    const io = new Server({
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      },
      transports: ['websocket'],
      allowEIO3: true,
      pingTimeout: 50000,
      pingInterval: 15000,
      maxHttpBufferSize: 1e8
    })

    // 显式创建HTTP服务器
    io.listen(port)

    // 监听底层HTTP服务器事件
    io.httpServer.on('listening', () => {
      logger.info(`服务已启动在端口:${io.httpServer.address().port}`)
    })

    io.on('error', (err) => {
      logger.error('Socket.IO服务启动失败:', err)
    })
    return io
  } catch (err) {
    logger.error('Socket.IO服务启动失败:', err)
  }
}

/**
 * 载入监听服务
 * @param {服务器实例} io
 */
export function Start(io, type) {
  try {
    io.on('connection', (socket) => {
      logger.info('a user connected__' + socket.id)

      socket.on('getCounter', () => {
        logger.info('getCounter')
        io.emit('user-count', io.engine.clientsCount)
      })
      socket.on('webrtc-offer', (data) => {
        // 添加type标识转发到对应终端
        io.emit('webrtc-offer', { ...data, origin: type })
      })
    })
  } catch (err) {
    logger.error('Socket.IO服务启动出错:', err)
  }
}
