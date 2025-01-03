import os from 'node:os'

// os.EOL换行符，不同系统的换行符不同，windows是\r\n，linux是\n。使用这个能统一
console.log('aa', os.EOL, 'bb')
// console.log('os.cpus：', os.cpus())

console.log('os.type：', os.type())
console.log('os.userInfo：', os.userInfo())
// 可用内存
console.log('os.freemem：', os.freemem())
// 总内存
console.log('os.totalmem：', os.totalmem())
// home目录
console.log('os.homedir：', os.homedir())
// 网卡信息
console.log('os.networkInterfaces：', os.networkInterfaces())
