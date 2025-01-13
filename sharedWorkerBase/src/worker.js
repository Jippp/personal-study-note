
const ports = []

// 在sharedWorker中，要有一个onconnect函数，sharedWorker启动时会自动执行，然后在其中通过start方法来启动端口，onmessage方法来监听端口的消息
onconnect = function (e) {
  const port = e.ports[0]

  ports.push(port)

  // 在worker中接收到信息 然后通过port再发送回去
  port.addEventListener('message', function (e) {
    console.log('%c worker中接收到信息', 'color: red; font-size: 20px', e.data);

    // 广播给所有端口都发送信息
    ports.forEach(portItem => {
      portItem.postMessage(e.data)
    })
  })

  port.start()
}