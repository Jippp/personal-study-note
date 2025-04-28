---
date: 2024-09-19
title: react源码
category: react
tags:
- frontend
- react
description: React源码分析
---

# React原理篇介绍

按照React渲染机制来介绍的话，大概会经历这些阶段：页面需要渲染(更新或者是首次渲染)，首先是JSX转成render function，执行后生成VDom，经过Scheduler优先级的调度，每一次调度中执行Reconciler调和生成Fiber，生成Fiber的过程涉及到diff，有了Fiber树之后就进入commit阶段进行渲染，最后渲染到页面上，展示出新的页面。

- Scheduler总体进行调度
- 每一次调度的任务就是一次更新，即Reconciler
- 在Reconciler中进行diff(如果有旧的fiber树的话)，生成新的fiber树，拿到更新之后的fiber树，执行渲染任务，更新视图。

commit是同步的，主要作用就是将fiber转成真实dom。
有三个阶段：beforeMutation mutation layout
每个阶段又分为三个小阶段：commitxxxEffects commitxxxEffects_begion commitxxxEffects_complete

会从`finishedWork`节点开始遍历，即从叶子节点开始回到root节点。

commitxxxEffects是每个阶段的入口函数，主要工作就是从finishedWork起个头开始遍历，接着调用commitxxxEffects_begin

commitxxxEffects_begin是执行一些副作用，subtreeFlags子节点的副作用，直到没有子节点时调用commitxxxEffects_complete

commitxxxEffects_complete时针对flags做处理，并且向兄弟节点、父节点开始遍历

beforeMutation阶段主要做一些前置工作，如清除HostRoot挂载内容，方便mutation阶段的渲染

mutation阶段主要是操作dom，首先清掉ref layout再重新赋值，执行了effect、layouteffect的destory函数

layout阶段主要是一些善后操作，比如赋值ref、执行effect和layouteffect的create函数

说实话 这b源码是真不懂，只能确定是mutation时执行的destory，再layout重新执行了create。没找到effect和layouteffect的顺序。既然如此，记住layouteffect的destory先执行的；layouteffect的create是同步执行的；

## React事件顺序

React提供了一个`onClick`合成事件，在冒泡时触发；`onClickCapture`合成事件，在捕获时触发。

所以React合成事件和原生DOM事件的触发顺序：
- 从root到目标元素，依次触发React合成事件中的捕获阶段(onClickCapture)
- 然后再从root到目标元素，依次触发原生DOM事件的捕获阶段
- 目标元素
- 触发原生DOM事件的冒泡
- 触发React合成事件的冒泡(onClick)
