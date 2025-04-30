function requestLimit(urlList: string[], max: number) {
  const total = urlList.length

  return new Promise(resolve => {
    let curIdx = 0
    let activeCount = 0
    const result: any[] = []

    function _request() {

      if(curIdx >= total && activeCount === 0) {
        resolve(result)
        return
      }
      
      while(activeCount < max && curIdx < total) {
        activeCount++
        const i = curIdx++

        console.log(`-> 发出请求 ${i}`)

        fetch(urlList[i]!)
          .then(res => res.json())
          .then(data => {
            console.log(`<- 收到响应 ${i}`)
            result[i] = data
          })
          .catch(err => {
            console.log(`<- 收到响应 ${i}`)
            result[i] = err
          })
          .finally(() => {
            activeCount--
            _request()
          })
      }

    }

    _request()
  })
}

const urls = []
let i = 0
while(i < 7) {
  i++
  urls.push(`http://localhost:5011/info/${i}`)
}

requestLimit(urls, 3).then(res => {
  console.log(res)
})

