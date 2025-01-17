import express from 'express'

const port = 8000
const app = express()

app.get('/', (req, res) => {

  // 非同源需要设置跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 添加响应头 
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // 立即发送头部信息，让客户端开始接收数据
  res.flushHeaders()

  let count = 1
  setInterval(() => {
    res.write(`data: ${count++}\n\n`)
  }, 1000)

})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
