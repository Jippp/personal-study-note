---
date: 2024-10-08
title: Next入门篇三 常见渲染方式CSR SSR SSG ISR等
category: Next

tags:
- frontend
- Next
description: Next入门介绍，常见的渲染方法CSR、SSR、SSG、ISR等
---

# 常见的页面渲染方式以及Next如何实现

在Next的app路由下，改为了Server Component以及Client Component的概念，这几种渲染方式的概念被弱化了。所以**下面介绍的都是的page route下的**。

## CSR Client-Side Rendering

现在最常用的一种渲染方式，即客户端渲染，将主要的渲染工作都放到客户端执行。

访问页面时，浏览器会先下载一个非常小的HTML文件和所需的JavaScript文件。

客户端渲染最大的问题是不够快，在下载、解析、执行JS以及未响应前，页面是不完全的。

### Next中实现

pages router下常规的写法即可，但是在app router下默认都是`Server Component`，所以需要使用`'use client'`声明为`Client Component`。

## SSR Serve-Side Rendering

服务端渲染，即将主要的渲染工作都交给服务端。

在服务端请求接口、获取数据，然后渲染成静态HTML文件给客户端展示。

虽然渲染速度会更快，但是SSR需要请求接口渲染成HTML，所以响应时间会更长，即TTFB(Time To First Byte)更长。

### Next中实现

由于Next存在两种路由方式：`pages路由`以及`app路由`。

#### pages路由中

pages路由中，通过定义`getServerSideProps`函数，来实现`SSR`

```js
// pages/ssr.js
export async function getServerSideProps() {
  const res = await new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        test: '12333'
      })
    }, 5000)
  })
 
  return { props: { data: res } }
}

export default function Page({ data }) {
  return <p>{JSON.stringify(data)}</p>
}
```

需要注意一下，`getServerSideProps`返回的值会自动作为组件的`props`传入。

#### app路由中

通过`Server Components`直接获取数据即可。

> [!NOTE]
> Next中默认都是Server Compoents。通过`use client`来标识Client Components

```js
// app/srr/page.js
const getData = async () => {
  const res = await new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        test: '12333'
      })
    }, 5000)
  })
  return res
}

export default async () => {
  const res = await getData()

  return <h1>{JSON.stringify(res)}</h1>
}
```

## SSG Static Site Generation

静态站点生成。如果需要所有人看到的内容都是一样的，可以直接先获取数据，提前编译成HTML文件，用户访问时直接返回静态的HTML文件即可。

在`Next`中，组件没有获取数据，就默认是`SSG`，在**构建时**会生成一个单独的HTML文件。

如果需要获取数据，也可以使用`SSG`：

通过`getStaicProps`，用法和`getServerSideProps`是一样的，都是返回一个props对象，next自动将这个对象传递给组件。

但是和`getServerSideProps`还是不太一样的，`getStaticProps`会在每次构建时调用；而后者是在每次请求时调用。

另外还提供了`getStaticPath`来定义预渲染的路径。

> 这两个方法都是在pages路由下的

## ISR Incremental Static Regeneration

增量静态再生。即静态页面中有些数据是需要变化的，比如博客页面的点赞、收藏等，只用SSG是无法准确获取的。通过ISR能解决这个问题。

通过ISR，用户第一次访问时是老的HTML内容，同时Next静态编译了新的HTML文件，等第二次再次访问该资源时，就会变成新的HTML内容。

Next的pages路由中实现ISR，只需要在`getStaticProps`返回值中添加`revalidate`即可。该属性表示当发生请求时，至少间隔多少秒才更新页面。简单来说，就是在指定的秒内访问的都是旧的HTML，超过这个时间后访问会构建新的HTML，但是看到的还是旧的，等到再次访问才是新的HTML。

## 总结

在Next中上面几种方式是可以混用的，默认是`SSG`，会渲染成静态HTML；有`getServerSideProps`时就使用`SSR`模式。

同一个页面也可以是`SSG + CSR`的方式，即`SSG`提供静态页面，为首屏加载提速，`CSR`动态填充内容，提供交互。

```js
// pages/postList.js
import React, { useState } from 'react'

export default function Blog({ posts }) {
  const [data, setData] = useState(posts)
  return (
    <>
      <button onClick={async () => {
          const res = await fetch('https://jsonplaceholder.typicode.com/posts')
          const posts = await res.json()
          setData(posts.slice(10, 20))
      }}>换一批</button>
      <ul>
        {data.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </>
  )
}

export async function getStaticProps() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  const posts = await res.json()
  return {
    props: {
      posts: posts.slice(0, 10),
    },
  }
}
```

