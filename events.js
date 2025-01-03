const EventEmitter = require('node:events')

class TestEmitter extends EventEmitter {}

const testEmitter = new TestEmitter()

testEmitter.on('test', (data) => {
  console.log('on触发的test event：', data)
})

testEmitter.once('test1', (data) => {
  console.log('once触发的test1 event：', data)
})

testEmitter.emit('test', 'test data11')
testEmitter.emit('test', 'test data22')
testEmitter.emit('test1', 'test1 data11')
testEmitter.emit('test1', 'test1 data22')