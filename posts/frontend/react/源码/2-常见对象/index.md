---
date: 2024-09-19
title: react源码2-常见对象
category: react
tags:
- frontend
- react
description: React源码中的常见对象
---
## 常见对象

### 工作循环

在react运行时有两个东西是循环工作的。

#### fiber构造循环

该循环是在`react-reconciler`包中的，封装在回调函数中，是用来生成fiber树的。

是以`树`为基础，循环过程是一个`深度优先遍历`

#### 任务调度循环

该循环是在`scheduler调度器`中的，循环调用，调度着所有的任务(这个任务就是`react-reconciler`包传过来的回调函数，当然也可以是其他传进来的回调)。

是以`小顶堆`为基础，循环取`小顶堆的顶点`，直到`堆为空`

#### 联系

从上面两个循环任务的工作来看，fiber构造循环是小循环，任务调度循环是大循环。在每次任务调度循环中，都会执行fiber构造循环。

react的主要工作也是围绕着这两个循环来的，完成了这两个循环，离`输入转为输出`的目的也就不远了：

1. 将每一次更新任务(新增、删除、修改节点之后)当做一次输入
2. 然后注册调度任务，即在`react-reconciler`收到输入之后，将该更新任务封装到一个回调函数中(`fiber构造循环`)，将回调函数传给`scheduler调度器`。
3. 执行调度任务，在`scheduler`调度器中，通过`任务调度循环`来执行任务
   1. 执行`react-reconciler`传入的回调，即执行`fiber构造循环`构造出 新的fiber树
   2. 执行`commitRoot`，将最新的fiber树渲染到页面上

react的主要任务就是上面说的，当然做了很多优化。

### 常见的对象

#### ReactElement对象(react包中)

即React组件，通常认为从`App`开始的所有节点都是`ReactElement`对象，区别在于`type`不同。所有的jsx经过编译转换之后都会以`React.createElement`的方式来创建`ReactElement对象`。

该对象上有很多属性，最需要注意的是`key`和`type`

- key在`reconciler`阶段用到，具体是在diff过程中用到的
- type属性决定了该节点的类型，然后在`reconciler`阶段，会根据type来进行具体的渲染逻辑(构建fiber树)

#### ReactComponent对象(react包中)

是`ReactElement`对象的子类。包含了类组件和函数组件

类组件的ReactComponent是class类型，会继承父类的Component。

函数组件的ReactComponent是function类型。

#### Fiber对象(react-reconciler包中)

Fiber对象代表的是一个即将渲染或者已经渲染的组件。Fiber对象中也有很多属性