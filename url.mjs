import url from 'node:url'
import http from 'node:http'

const testUrl = new url.URL('http://www.baidu.com')

// console.log('testUrl', testUrl)
// console.log('testUrl.searchParams', testUrl.searchParams.get('a'))

// console.log(url.urlToHttpOptions(testUrl))

const req = new http.request(url.urlToHttpOptions(testUrl), (res) => {
  
  res.on('data', (chunk) => {
    console.log('chunk', chunk.toString())
  });
  res.on('end', () => {
    console.log('end')
  })
})

req.end()
