const path = require('node:path')

// 当前文件的绝对路径
const filePath = __filename
// 还有一个__dirname 表示当前文件所在文件夹的绝对路径
// 这两个都是commonjs中的，如果在esm中不能用

// console.log('当前文件的绝对路径', filePath);
// console.log('当前文件所在文件夹的绝对路径', path.dirname(filePath))
// console.log('当前文件名称', path.basename(filePath))
// console.log('当前文件后缀名', path.extname(filePath))

// 拼接多个路径，根据给的路径决定返回绝对路径还是相对路径
console.log('path.join', path.join('../', 'events.js'))
// 拼接多个路径，返回绝对路径
console.log('path.resolve', path.resolve('./', '../events.js'))
// 两个路径a和b，返回a到b的相对路径
console.log('path.relative', path.relative('./', '../events.js'))
// 根据给的路径返回一个对象
console.log('path.parse', path.parse(filePath))