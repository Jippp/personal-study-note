---
date: 2024-09-19
title: react源码1-宏观结构
category: react
tags:
- frontend
- react
description: React源码分析
---

## 源码的宏观结构

### 包结构

React的源码包含很多包，其中常用的大概只有4个。

#### react

最最常用的包，也是最基础的包，提供了`react组件`的一些必要函数，一般是和`渲染器`一块使用(react-dom、react-native)。在平时的代码中，大部分用到的api都是这个包引入的。

#### react-dom

react提供的渲染器之一，该渲染器可以将运行结果输出到web界面上。该渲染器是可以在浏览器和nodejs环境中使用的。平时用到的应该只有在入口文件中的:

```ts
import { ReactDOM } from 'react-dom'
ReactDOM.render(<App />, doucument.getElementById('root'))
```

该包中主要完成的工作有：

- 通过`ReactDOM.render`完成react应用的启动
- 实现`HostConfig协议`

> [HostConfig协议](https://github.com/facebook/react/blob/v17.0.2/packages/react-reconciler/README.md#practical-examples)
>
> 是一个对象，对象中有各种属性和方法。简单点来说就是用来模拟宿主环境是如何渲染页面的，通过这一层适配器，就可以解决不同环境的渲染兼容问题。
>
> 该协议是渲染器必须要实现的。

#### react-reconciler

react运行的核心包之一，是用来协调`react-dom`、`react`、`scheduler`各包之间的调用和配合。

该包管理着react应用状态的输入和结果的输出，是将输入转为输出传递给渲染器(`react-dom`/`react-native`)

具体做的事情有这么几个：

- 接受`react-dom`/`react`的输入(初次render或dispatchAction更新)，根据输入来生成一个fiber树(将生成逻辑放到一个回调函数`performSyncWorkOnRoot/performConcurrentWorkOnRoot`中，包括fiber树的结构、队列、调和算法等)
- 将生成fiber树的回调放到`scheduler`进行调度
- 在`scheduler`中根据优先级来控制回调函数执行的时机，执行完成之后就可以得到新的fiber树
- 最后调用渲染器(`react-dom`/`react-native`)将fiber树转为真实DOM渲染到页面上。

#### scheduler

也是react运行的核心包之一，用来实现优先级调度的

- 核心工作就是执行`react-reconciler`提供的回调函数
- 通过控制回调函数的执行时机，可以达到任务分片的目的，进而实现`可中断渲染`

在这个包中会将接受到的回调函数，包装到一个任务对象中，在这个任务对象中按照优先级先后来维护一个队列，循环任务队列，直到为空。

### 关系

这几个包在react运行时是相互联系和配合，最后完成渲染工作的。

在`react-dom`渲染器中接受fiber树形结构，然后通过`HostConfig`转为页面可以显示的真实DOM

在`react-reconciler`中主要就是为了生成fiber树(diff)

在`scheduler调度器`中接受`react-reconciler`传过来的`生成fiber树的回调`，在调度器中实现了优先级以及可中断的更新。