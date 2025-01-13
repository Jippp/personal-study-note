import io, { Socket } from 'socket.io-client';

export class WsInstance {
  
  socket: Socket  | undefined
  
  constructor() {
    this.socket = undefined

    this.init()
  }

  init() {
    if(!this.socket) {
      this.socket = io('http://localhost:8000')
      this.socket.on('init', () => {
        console.log('Server is init!')
      })
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if(!this.socket) return
    this.socket.on(event, callback)
  }

  emit(event: string, data: any) {
    if(!this.socket) return
    this.socket.emit(event, data)
  }
}
