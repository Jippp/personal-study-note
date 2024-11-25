---
date: 2024-11-12
title: 微前端原理-V8隔离
category: MicroFontend
tags:
- fontend
- MicroFontend
description: 从V8隔离的角度来深入微前端设计
---

# V8隔离

## 背景

通过动态Script脚本的方式实现的微前端，所有的JS都运行在同一个执行上下文中，所以很可能发生变量冲突等问题，从而导致微前端应用出错。所以在设计微前端应用时，需要了解V8的隔离原理。

## V8隔离的大致原理

在V8中，每一个上下文都一个单独的类。iframe会新建一个类。所以iframe实现的微前端，是可以做到全局执行上下文隔离的。而NPM方案、动态Script方案、WebComponents方案，都处于同一个render进程中，并且都在同一个Context上下文中。所以是无法通过浏览器默认能力实现上下文隔离的。

### Isolate隔离

Isolate隔离，主要是物理空间的隔离，有自己的堆内存和垃圾回收器等资源，可以防止跨站攻击。不同的Isolate之间的内存和资源是相互隔离的，无法共享数据。

### Context隔离

指的是在同一个Isoloate中，创建不同的Context，这些Context有自己的全局变量、函数、对象等。默认情况下不同Context对应的JS全局上下文无法访问其他的全局上下文。

## 浏览器的线程和任务

在浏览器中，每个进程内有多个线程，每个线程内又有多个任务。

> [!NOTE]
> [Chromium文档](https://chromium.googlesource.com/chromium/src.git/+/HEAD/docs/threading_and_tasks.md#threads)

### 线程 Threads

Chrome中每个进程都有：
- 一个主线程
  - Browser进程中的主线程`Browser Thread::UI` 用来更新UI
  - Renderer进程中的主线程`Blink main thread` 用来运行大部分的Blink
- 一个IO线程
  - 在Browser进程中叫做`BrowserThread::IO`
  - 该线程主要用来处理进程间通信的，也就是IPC通过该线程完成进程通信。
  - 另外大多数的I/O异步操作也在该线程完成，当然一些比较耗时的会通过其他工作线程或线程池来完成。
- 一些特殊用途的线程
- 通用线程池

大多数的线程中都有一个**消息循环**，通过该循环从**任务队列**中获取**任务**并运行。任务队列是被多个线程共享的。

### 任务 Tasks

任务是添加到任务队列中等待异步执行的工作单元，在Chromium中体现为`base::OnceClosure`，通过`base::BindOnce`和`base::BindRepeating`创建的。

> [!NOTE]
> 可以将`base::OnceClosure`类比为JS中一个只执行一次的函数，通过该封装器可以实现**只执行一次**的逻辑。

### 渲染进程 Renderer Process

在Chrome中由于沙箱隔离和站点隔离，一般一个标签页就对应一个渲染进程，并且渲染进程会运行在沙箱环境中。
在渲染进程中，主要运行的就是渲染引擎，Chrome就是Blink引擎。
上面说一个进程会有一个主线程、io线程以及一些其他线程，所以渲染进程中：
- 主线程：解释执行JS、DOM解析创建、样式计算和布局等。
- 渲染线程：页面视图渲染
- 其他的一些线程

在线程会有多个任务，通过消息循环从任务队列中执行这些任务。

> [!NOTE]
> Chrome DevTools Performance面板中，可以看到这些任务(灰色的)，以及具体的任务名称
> 在该面板中可以看到UI渲染的任务和V8中对JS的编译执行都是在同一个线程中的，这也是JS执行和页面渲染冲突的来源。浏览器就是这么设计的。

## V8的编译




