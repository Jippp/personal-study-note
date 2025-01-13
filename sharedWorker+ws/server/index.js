import express from 'express';
import http from 'node:http'
import { WebSocketServer } from 'ws'
import cors from 'cors'

const app = express()
app.use(cors())

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

const users = new Set([])
wss.on('connection', (ws) => {
  console.log('ws connection')

  users.add(ws)

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('ws服务端收到消息:', data);
      
      // 广播消息给所有客户端
      users.forEach((client) => {
        
        client.send(JSON.stringify(data));
      });
    } catch (error) {
      console.error('消息处理错误:', error);
    }
  })

  // 省略 error close等事件
  ws.on('close', () => {
    console.log('ws close')
    users.delete(ws)
  })

  ws.on('error', () => {
    console.log('ws error')
    users.delete(ws)
  })
})

server.listen(8000, () => {
  console.log(`Server is running http://localhost:8000`)
})
