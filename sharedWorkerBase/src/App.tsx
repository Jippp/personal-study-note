import { FC, memo, useEffect, useRef } from 'react'

import { MySharedWorker } from './sharedWorker'

const App: FC = () => {
  const workerRef = useRef<MySharedWorker>()

  useEffect(() => {
    const worker = new MySharedWorker()
    worker.start()

    workerRef.current = worker
    worker.onMessage((e) => {
      console.log('%c 接受到的信息', 'color: red; font-size: 20px', e.data);
    })
  }, [])

  const send = () => {
    if (workerRef.current) {
      workerRef.current.postMessage(`发送信息${Date.now()}`)
    }
  }

  return (
    <>
      <button onClick={send}>发送信息</button>
    </>
  )
}

export default memo(App)