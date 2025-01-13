let ws = null;
const ports = new Set();

// 创建 WebSocket 连接
function createWebSocket() {
  ws = new WebSocket('ws://localhost:8000/ws');

  ws.onopen = () => {
    broadcast({ type: 'connection', status: 'connected' });
  };

  ws.onmessage = (event) => {
    // 广播消息给所有连接的标签页
    broadcast(event.data);
  };

  ws.onclose = () => {
    broadcast({ type: 'connection', status: 'disconnected' });
    // 可以在这里添加重连逻辑
    setTimeout(createWebSocket, 3000);
  };

  ws.onerror = (error) => {
    broadcast({ type: 'error', error: 'WebSocket error' });
  };
}

// 处理新的标签页连接
onconnect = function (e) {
  const port = e.ports[0];
  ports.add(port);

  // 如果是第一个连接，创建 WebSocket
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    createWebSocket();
  }

  port.onmessage = function (e) {
    // 处理来自标签页的消息
    if (ws && ws.readyState === WebSocket.OPEN) {
      if(e.data && e.data.eventType === 'message') {
        ws.send(JSON.stringify(e.data));
      }else {
        console.log('sharedWorker 收到消息', e.data)
      }
    }
  };

  // 当标签页断开连接时清理
  port.onmessageerror = () => {
    ports.delete(port);

    // 如果没有活动的标签页了，关闭 WebSocket
    if (ports.size === 0 && ws) {
      ws.close();
      ws = null;
    }
  };

  port.start();
};

// 广播消息给所有标签页
function broadcast(data) {
  ports.forEach(port => {
    port.postMessage(data);
  });
}