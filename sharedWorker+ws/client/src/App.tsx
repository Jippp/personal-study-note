import { FC, memo, useEffect, useRef } from 'react'

import { MySharedWorker } from './worker/sharedWorker'

const App: FC = () => {

  const workerRef = useRef<MySharedWorker | null>(null)
  
  useEffect(() => {
    const sharedWorker = new MySharedWorker()
    workerRef.current = sharedWorker

    workerRef.current?.onMessage((e) => {
      console.log('client message', e.data)
    })

  }, [])

  const send = () => {
    workerRef.current?.postMessage({
      eventType: 'message',
      data: 'hello'
    })
  }

  return (
    <>
      <button onClick={send}>发送信息</button>
    </>
  )
}

export default memo(App)