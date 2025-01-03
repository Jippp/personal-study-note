import http from 'node:http'
import fs from 'node:fs'

const server = http.createServer((req, res) => {
  const writeStream = fs.createWriteStream('./http.txt', 'utf-8')

  req.pipe(writeStream)

  res.write('Hello!')
  res.end('done.')
})

server.listen(3300)

// curl -X POSt -d 'hello' http://localhost:3300
