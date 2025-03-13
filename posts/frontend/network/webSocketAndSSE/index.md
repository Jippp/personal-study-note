---
date: 2025-01-17
title: WebSocket和SSE的区别
category: Network
tags:
- frontend
- Network
description: 比较WebSocket和SSE的区别
---

# 背景

WebSocket和SSE都是**实时数据交换协议**，都是位于应用层的上层应用协议，基于传输层的TCP/IP协议。

但是实际这两种协议有很大的差别，下面来看看它们的区别。

> [!NOTE]
> 省流：WebSocket侧重双向通信，SSE侧重服务端持续推送信息。

## 概念介绍

### WebSocket

是一种**全双工**的通信协议，能够在服务端和客户端实现**实时数据交换**。

#### 工作原理是

- 首先WebSocket在服务端和客户端之间建立了一个持久的双向连接：
  1. 客户端向服务端发送一个HTTP请求，请求升级为WebSocket协议。`Connection: Upgrade`、`Upgrade: websocket`这两个重要的头部信息，还有一些其他的头部这里忽略不计。
  2. 服务端收到请求后，进行协议升级，返回一个HTTP响应，状态码为101。
  3. 客户端和服务端之间的连接建立成功，双方可以通过该连接进行实时数据交换。
- 持久连接直到某一方决定关闭该连接。

#### 优势

- 全双工通信：客户端和服务端可以同时发送和接收数据，不需要等待对方的响应。
- 低延迟：因为是持久连接，所以减少了重复建立和断开连接的消耗。
- 减少带宽：WebSocket只需要一次连接，后面的只需要携带数据信息就好，所以减少了多次连接的请求头消耗。

#### 缺点

最重要的就是安全，明文传输加上全双工，安全性是个大问题，所以一般必须要配合HTTPS来使用。

### SSE Server-Sent Events

是一种**单向**的通信协议，只能服务端向客户端发送数据。

该协议是HTML5规范的一部分，通过使用单一、持久的HTTP连接实时传输数据。

SSE依赖两个基本组件：

- EventSource：浏览器端实现的接口，让浏览器可以订阅服务器发送的事件
- EventStream：是一种协议规范，规定服务端必须用**纯文本格式**来发送事件，确保能和EventSource客户端兼容，以此来实现无缝通信。

规范中，事件由**任意文本数据**和**一个可选ID**组成。另外必须使用 **`Content-Type: text/event-stream`** 来标识事件流。

#### 工作原理

基于HTTP协议，从服务端到客户端建立一个持久、单向的通信通道。
客户端通过`EventSource`接口订阅服务端的事件，一旦服务端有新的事件发生，就会立即发送给客户端。
服务端的实现也很简单，只需要在原来基于HTTP的基础上添加几行代码就可以：

##### 服务端代码
```js{8-11}
// someServer.js
import express from 'express'

const port = 300
const app = express()

app.get('/sseApi', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // 需要发送的信息 这里用setInterval来模拟
  const intervalId = setInterval(() => {
    const data = `data: ${new Date().toLocaleString()}\n\n`
    res.write(data)
  }, 1000)
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
```
可以看到，只需要添加一些头部信息，就可以实现SSE：
- `Content-Type: text/event-stream`：类型标识，表示是事件流
- `Cache-Control: no-cache`：不缓存(用完后立即失效，下一次从服务端获取，即协商缓存)，每次都是新的
- `Connection: keep-alive`：HTTP1.1的长连接，想要关闭长连接要改为`Connection: close`
- `res.flushHeaders()`：立即发送头部信息，这样客户端能尽早的监听事件

##### 客户端代码

```js
// someClient.js
const event = new EventSource('http://localhost:8000');

event.addEventListener('message', (event) => {
  console.log('%c message', 'color: red; font-size: 20px', event.data);
})

event.addEventListener('ping', (event) => {
  console.log('%c ping', 'color: red; font-size: 20px', event);
})
```

这里的客户端和服务端代码都只是一个简单的示例来说明的。

> [!NOTE]
> 以上SSE的示例代码可以在`github`仓库的[`该分支`](https://github.com/Jippp/personal-study-note/pull/new/network/wsAndSSE)找到

## 总结

可以看到，虽然这两个都是用来实时通信的，但是还是有很大差别的。

最大的不同就是：WebSocket是全双工，并且侧重于双向通信；SSE是单向的，并且侧重于服务端持续推送信息。
