import express from 'express'
import morgan from 'morgan'
import path from 'path'
import config from './config.js'

const app = express()

const { port, host } = config

// 打印请求日志
app.use(morgan('dev'))
// 跨域
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Allow", "GET, POST, OPTIONS");
  next();
})

// 静态资源
app.use(
  express.static(path.join('public', 'micro'))
)


app.listen(port.micro, host)

console.log(`Micro Server is running http://${host}:${port.micro}`)
