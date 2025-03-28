---
date: 2024-10-10
title: Next入门篇四 RSC和SSR
category: Next

tags:
- frontend
- Next
description: Next入门介绍，介绍一下ReactServerComponent和ssr的区别
---
# Server Component

Next13推出了基于React Server Component的App Route路由解决方案，引入了`Server Component`概念，之后Next组件开始区分客户端组件和服务端组件。

## 为什么引入Server Component

> [参考这里](https://sorrycc.com/why-react-server-components/)

CSR(Client Side Rendering 客户端渲染)典型的SPA应用中，客户端首次请求时，服务器会返回一个包含单个div标签(用来挂载内容)和多个script标签的HTML文件，JavaScript文件中包含了应用程序运行所需的东西。

正是因为CSR的一些缺点，所以才会有React Server Component：

1. 首先，对SEO不友好。因为没有内容，需要和服务器交互之后才有相关内容。
2. 其次也是最重要的，浏览器处理所有工作(获取数据、UI、交互等)会使得页面很慢，用户会看到大量的空白或加载动画。而且客户端组件可能需要多次HTTP请求才能拿到页面数据，使得页面交互很慢，而且为了满足状态需要很多状态相关的代码，之后很难维护。

引入Server Component，将数据请求放到服务端，服务端直接给客户端**返回带有数据和样式的组件**。

## SSR

在Next12的page route中，通过`getServerSideProps`的方式来实现SSR。

SSR是早于CSR的，只是后来因为AJAX技术的兴起，导致SSR被抛弃了，但是随着网速的提升以及用户需求的提升，让SSR再次回归。

在SSR中，服务端负责渲染完整的HTML，并不是返回一个几乎为空的HTML文件，让JS来构建页面。
因为几乎是完整的HTML，不需要JS文件，所以浏览器解析变快了，因此提高了页面首次加载速度；而且也对SEO友好。

SSR可以解决CSR的问题，但是也是有缺陷的。
我们知道浏览器中HTML是没有交互能力的，JavaScript提供了交互能力，这个阶段称为**水合(Hydration)**。
浏览器解析页面时是先下载HTML文件开始解析，遇到JS文件才加载并解析的。在JS文件被加载之前，页面是没有交互功能的。

所以这些特性也导致了SSR的缺点：

1. 数据获取必须在组件渲染之前，也就是必须要在服务端拿到数据组成完整页面之后才会返回给客户端，所以服务端的响应会变慢。
2. 客户端为从服务器获取的HTML添加交互(即加载JS文件)，浏览器的组件树必须要和服务器生成的组件树完全匹配。即所有组件的JS都必须要在客户端加载完成之后，才能进行**水合Hydration**。
3. 所有组件必须先水合，才能和其中的组件交互。

简单点来说，SSR中，必须要先加载整个页面的数据、加载整个页面的JS才能为整个页面进行水合。直接从无到全有的过程，会很低效。

以上缺点让SSR只能在**页面初始化加载时**使用。

## React Server Component

React Server Component，和SSR的概念很像，都是在服务端进行数据请求，都是为了更快的呈现页面。

React Server Component提供了**更细粒度**的组件渲染方式，可以在服务端直接返回带有数据的**组件**，另外组件在服务端渲染，该组件依赖的代码也不会打包到bundle中。
直接返回带有数据的组件，所以服务端返回的格式肯定是特定的，称为**RSC Payload**。
等到**客户端请求该组件才返回给客户端**，客户端接收到RSC Payload会重建React的树来修改DOM。

SSR是在服务端将组件渲染成**HTML**发送给客户端。

两者最大的区别在于RSC返回的是RSC Payload格式，SSR返回的是一个HTML文件。由于格式的不同，造成了两者产生根本上的不同，即RSC可以**保持状态** 并且可以做到**局部更新**。

> RSC Payload实际还是JSON格式

### 优点

1. 减少了发送到前端的资源，服务端组件将代码保留在服务端，**减少了很多依赖项**，这样就能提高网络请求的速度。此外还消除了hydration的步骤，因为服务端已经渲染好了，这就**加快了应用程序的加载和交互速度**。
2. 因为运行在服务端，可以**直接访问服务端的资源**；也更加的安全。
3. **提高了首屏加载速度和FCP(首次内容绘制)**：因为在服务端已经生成好了，发送到客户端直接渲染即可。

