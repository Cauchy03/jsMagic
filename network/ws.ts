import WebSocket from "ws";

// 创建5121端口
const wss = new WebSocket.Server({ port: 5121 }, () => {
  console.log('socket服务启动5121')
})

const state = {
  HEART: 1,
  MESSAGE: 2
}

// 监听客户端连接
wss.on('connection', (socket) => {
  console.log(socket.on, '客户端连接成功个数：',wss.clients.size)
  // 监听消息
  socket.on('message', (e) => {
    // 单发
    // socket.send(e.toString())

    // wss.clients用于记录连接ws服务端的客户端个数 一个Set结构
    // 用于群发消息
    wss.clients.forEach(item => {
      item.send(JSON.stringify({
        type: state.MESSAGE,
        message: e.toString()
      }))
    })
  })

  // socket长时间不使用，遇到网络波动、弱网模式可能会断开
  // 心跳检测 进行保护机制
  let heartInterval: any = null

  heartInterval = setInterval(() => {
    // 等于OPEN 才会发送心跳
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: state.HEART, message: '心跳检测' }))
    } else {
      clearInterval(heartInterval)
    }
  }, 5000)
})


