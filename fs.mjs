import fs from 'node:fs'
import { EOL } from 'node:os'

// 文件夹的创建、重命名、删除
// fs.mkdirSync('test')

// setTimeout(() => {
//   fs.renameSync('test', 'test2')
// }, 1000)

// setTimeout(() => {
//   // 找不到会报错
//   fs.rmdirSync('test2')
// }, 2000)

// 文件的写入、追加、删除
// fs.writeFileSync('./test.txt', 'hello world' + EOL)

// setTimeout(() => {
//   fs.appendFileSync('./test.txt', 'fs append' + EOL)
// }, 1000)

// setTimeout(() => {
//   // 删除文件
//   fs.unlinkSync('./test.txt')
// }, 2000)

// 递归创建文件夹
fs.mkdirSync('aa/bb/cc/dd', { recursive: true })

fs.writeFileSync('aa/a.txt', 'hello a' + EOL)
fs.writeFileSync('aa/bb/b.txt', 'hello b' + EOL)
fs.writeFileSync('aa/bb/cc/c.txt', 'hello c' + EOL)
fs.writeFileSync('aa/bb/cc/dd/d.txt', 'hello d' + EOL)
