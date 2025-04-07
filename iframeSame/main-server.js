import express from 'express'
import morgan from 'morgan'
import path from 'path'
import config from './config.js'

const { port, host } = config

const app = express()

// 打印请求日志
app.use(morgan('dev'))
// 静态资源
app.use(
  express.static(path.join('public', 'main'))
)

app.post('/microapps', (req, res) => {
  // 子应用列表
  // 应该是管理后台新增后存储到数据库的列表信息，从而实现动态管理
  res.json([
    {
      name: "micro1",
      id: "micro1",
      // 这里暂时以一个入口文件为示例
      script: `http://${host}:${port.micro}/micro1.js`,
      style: `http://${host}:${port.micro}/micro1.css`,
      // 挂载到 window 上的启动函数 window.micro1_mount
      mount: "micro1_mount",
      // 挂载到 window 上的启动函数 window.micro1_unmount
      unmount: "micro1_unmount",
      prefetch: true,
    },
    {
      name: "micro2",
      id: "micro2",
      script: `http://${host}:${port.micro}/micro2.js`,
      style: `http://${host}:${port.micro}/micro2.css`,
      mount: "micro2_mount",
      unmount: "micro2_unmount",
      prefetch: true,
    },
  ])
})


app.listen(port.main, host)
console.log(`Main server is running: http://${host}:${port.main}`)
