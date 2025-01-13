import { FC, memo, useEffect, useRef } from 'react'

import { WsInstance } from './websocket'

const App: FC = () => {
  const wsRef = useRef<WsInstance | null>(null)

  useEffect(() => {
    const ws = new WsInstance()
    wsRef.current = ws
    ws.emit('online', Date.now())

    ws.on('other-online', (data) => {
      console.log('%c a new user online', 'color: red; font-size: 20px', data);
    })

    ws.on('message', (data) => {
      console.log('client message：', data)
    })
  }, [])

  const send = () => {
    if(!wsRef.current) return
    wsRef.current.emit('message', 'hello')
  }

  return (
    <>
      <button onClick={send}>ws 启动！</button>
    </>
  )
}

export default memo(App)