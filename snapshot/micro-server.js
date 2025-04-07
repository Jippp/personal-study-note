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
  express.static(path.join('public', 'micro')/* , {
    // http缓存控制
    cacheControl: true,
    // ms
    maxAge: 2000,
    etag: false,
    lastModified: true,
    setHeaders: (res) => {
      // 5s后缓存失效
      res.set('Expires', new Date(Date.now() + 5 * 1000).toUTCString())
    }
  } */)
)


app.listen(port.micro, host)

console.log(`Micro Server is running http://${host}:${port.micro}`)
