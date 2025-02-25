
const ports = []

const options = {
  etagUrl: '',
  updateUrl: '',
  // 轮询间隔
  time: 10000
}
let intervalId

onconnect = (e) => {
  const port = e.ports[0]

  ports.push(port)

  port.addEventListener('message', (e) => {
    console.log('%c worker收到的message', 'color: red; font-size: 20px', e);

    switch (e.data.type) {
      case 'init': {
        const opt = e.data.options || {}
        for(const key in opt) {
          options[key] = opt[key]
        }
        broadcast('Init')
        break
      }
      case 'startCheck': {
        if(intervalId) clearInterval(intervalId)
        if(options.etagUrl) {

          intervalId = setInterval(async () => {
            try {
              const data = await fetch(options.etagUrl, {
                method: 'HEAD',
                // 不能缓存
                cache: 'no-store'
              })
              broadcast({
                type: 'isCheck',
                data: data.headers.get('etag') || data.headers.get('last-modified')
              })
            } catch (error) {
              // broadcast({
              //   type: 'isCheck',
              //   data: 'check error'
              // })
              console.error(error)
            }
          }, options.time)
        }
        broadcast('Start check')
        break
      }
      case 'stopCheck': {
        if(intervalId) clearInterval(intervalId)
        broadcast({
          type: 'stopCheck',
          data: 'Stop check'
        })
        break
      }
      case 'checkIsUpdate': {
        if(options.updateUrl) {
          fetch(options.updateUrl)
            .then((res) => res.json())
            .then((res) => {
              broadcast({
                type: 'isUpdate',
                data: res.data
              })
            })
            .catch((error) => {
              console.error(error)
              // broadcast({
              //   type: 'isUpdate',
              //   data: 'isUpdate error'
              // })
            })
        }
      }
    }
  })

  port.start()
}

function broadcast(data) {
  ports.forEach(portItem => {
    portItem.postMessage(data)
  })
}


