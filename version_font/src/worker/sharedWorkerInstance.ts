export class MySharedWorker {

  workerInstance: SharedWorker | undefined
  port: MessagePort | undefined

  constructor() {
    this.workerInstance = undefined
    this.port = undefined

    this.init()
  }

  init() {
    // 单例
    if(!this.workerInstance) {
      try {
        this.workerInstance = new SharedWorker(new URL('./checkUpdateWorker.js', import.meta.url), {
          name: 'checkUpdateWorker'
        })
        this.port = this.workerInstance.port
  
        this.workerInstance.onerror = (e) => {
          console.error('SharedWorker 错误：', e)
        }
      } catch (error) {
        console.error('创建 SharedWorker 失败：', error)
      }
    }
  }

  start() {
    if(!this.port) return
    this.port.start()
  }

  postMessage(msg: any) {
    if(!this.port) return
    this.port.postMessage(msg)
  }

  onMessage(callback: (e: MessageEvent) => void) {
    if(!this.port) return
    this.port.onmessage = function(e) {
      callback(e)
    }
  }

}