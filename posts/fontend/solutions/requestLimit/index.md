---
date: 2025-01-08
title: 前端并发请求限制
category: Solutions
tags:
- fontend
- Solutions
description: 过多的并发请求，前端如何控制
---

并发请求是指同时发送很多个请求。这种并发请求一方面会造成浏览器资源的大量占用(端口、内存等)；另一方面也会导致服务器压力过大，处理不过来 导致响应变慢。

HTTP1.1之前没有长链接的时候，一次请求就要完成一次TCP连接(如果是HTTPS，SSL连接也需要重新建立)，这种请求下并发请求是很困难的，每次TCP连接会很耗时。

HTTP1.1长链接以及HTTP2的多路复用出现之后，可以复用TCP连接，减少了连接的耗时，但是过多的并发请求还是会迅速消耗大量端口，端口又是有限的；另外服务端的压力还是没有减少。

我们都知道，浏览器会限制**同一域名的TCP连接数**，HTTP1.1的时候一般是4-6个，超过的会进入排队状态等待前面的结束后发送；

HTTP2是多路复用，通过**流Stream**来控制请求发送和响应，所以可以同时发送多个请求，[RFC 7540](https://datatracker.ietf.org/doc/html/rfc7540#section-6.5.2)中通过**SETTINGS_MAX_CONCURRENT_STREAMS**来确定**对端的最大流**数量(如客户端设置该值来指定服务端可以发起的最大并发流数量)，协议中是没有一个规定值的(即无限制)。所以一般都是浏览器或服务器来自行设置最大数量。

一般浏览器会根据连接性能、资源使用情况、服务端的响应等来动态调整。超出最大并发流数量之后的处理单从该[网站](https://study.jixu.space/)来看是需要等待资源调度的，并发数过多还是会有等待时间的(即接口pending)，**但是由于目前并没有仔细探究过，所以具体尚未可知**。

![HTTP2的并发请求结果](image.png)

所以出于对以上各种问题的考虑，一般需要由前端来控制一个最大并发数，当然**需要根据实际情况来考虑**，如HTTP2加上该限制可能会导致多路复用的优势丢失。

## 实现

```ts{20-22,33-35}
class RequestLimit {
  /** 请求限制数 */
  limit: number;
  /** 阻塞队列 */
  blockQueue: Function[];
  /** 当前执行数 */
  currentCount: number;
  constructor(limit?: number) {
    this.limit = limit || 4;
    this.blockQueue = [];
    this.currentCount = 0;
  }

  /** 
   * 接收的request函数，应该在request第一次执行就用run方法包裹，而不是包裹其返回结果
   */
  async run<RequestResponse>(request: () => Promise<RequestResponse>) {
    // 如果当前执行请求数大于限制数，就通过一个await阻止继续往下执行
    // 等到上一个队列中的请求被发送出去了，阻塞队列中的值才会被执行，才会继续发其他请求
    if(this.currentCount >= this.limit) {
      await new Promise((resolve) => this.blockQueue.push(resolve))
    }

    this.currentCount++
    try {
      // 执行请求
      return await request()
    }catch(err) {
      return Promise.reject(err)
    }finally {
      this.currentCount--
      // 请求结束，将阻塞队列中的值执行，往下继续发送其他请求
      if(this.blockQueue.length) {
        this.blockQueue.shift()!()
      }
    }
  }
}

export default RequestLimit
```

使用方法如下：
```ts
const pLimit = new RequestLimit()

// 将请求的函数作为参数传入
pLimit.run(() => get(xxxx))
```

