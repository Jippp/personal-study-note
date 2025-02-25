import { useEffect, useRef } from 'react'

import { MySharedWorker } from "./sharedWorkerInstance"

const options = {
  etagUrl: 'http://localhost:5174',
  updateUrl: 'http://localhost:5174/release',
  // 30s 考虑是测试，可以减少一下时间 比如10s一次
  delay: 30000
}

export default () => {
  const prevResourceRef = useRef('')
  const workerInstanceRef = useRef<MySharedWorker>(null)
  
  useEffect(() => {
    workerInstanceRef.current = new MySharedWorker()
    workerInstanceRef.current.start()

    workerInstanceRef.current.postMessage({
      type: 'init',
      options: { ...options }
    })

    workerInstanceRef.current.postMessage({
      type: 'startCheck',
    })

    workerInstanceRef.current.onMessage((e) => {

      console.log('%c from worker?', 'color: red; font-size: 20px', e.data);

      switch (e.data.type) {
        case 'isCheck': {
          const newResource = e.data.data

          if(prevResourceRef.current !== newResource) {
            prevResourceRef.current = newResource
            workerInstanceRef.current?.postMessage({
              type: 'checkIsUpdate',
            })
          }else {
            // 不更新
          }
          break
        }
        case 'isUpdate': {
          // 判断版本号
          const oldVersion = import.meta.env.VITE_VERSION
          const newVersion = e.data.data

          if(oldVersion !== newVersion) {
            alert('有新版本啦！')
          }
          break
        }
      }
    })
  }, [])

  return workerInstanceRef.current
}