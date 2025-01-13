import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }
})

const users = new Set([])

io.on('connection', (socket) => {
  console.log('an new connection!')

  socket.emit('init', 'ws server is running')

  socket.on('online', (data) => {
    console.log('user online!')
    users.add(data)
    // 广播 给其他的，不会给自己
    socket.broadcast.emit('other-online', data)
  })

  socket.on('message', (data) => {
    console.log('ws message', data)
    socket.broadcast.emit('message', data)
    socket.emit('message', data)
  })
})

server.listen(8000, () => {
  console.log(`Server is running http://localhost:8000`)
})
