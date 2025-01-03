import url from 'node:url'

// esm中返回当前文件 以 file:// 开头的绝对路径
console.log('import.meta.url：', import.meta.url)
// esm中返回指定文件 以 file:// 开头的绝对路径
console.log('import.meta.resolve：', import.meta.resolve('./events.js'))

console.log('import.meta.dirname：', import.meta.dirname)
console.log('import.meta.filename：', import.meta.filename)

console.log('url.fileURLToPath：', url.fileURLToPath(import.meta.url))
