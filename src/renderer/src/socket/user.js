import { io } from 'socket.io-client'

/**
 * 创建链接
 * @param {地址} ip
 * @returns 连接实例
 */
export function createLink(ip) {
  const link = io(ip, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  })
  return link
}

// user01.on('connect', () => {
//   console.log('连接成功')
// })

// user01.on('user-count', (count) => {
//   usercount.value = count
// })
// const GetCounter = () => {
//   user01.emit('getCounter')
// }
