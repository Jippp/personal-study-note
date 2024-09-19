---
date: 2024-09-19
title: react源码
category: react
tags:
- fontend
- react
description: React源码分析
---

# React原理篇介绍

按照React渲染机制来介绍的话，大概会经历这些阶段：页面需要渲染(更新或者是首次渲染)，首先是JSX转成render function，执行后生成VDom，经过Scheduler优先级的调度，每一次调度中执行Reconciler调和生成Fiber，生成Fiber的过程涉及到diff，有了Fiber树之后就进入commit阶段进行渲染，最后渲染到页面上，展示出新的页面。

- Scheduler总体进行调度
- 每一次调度的任务就是一次更新，即Reconciler
- 在Reconciler中进行diff(如果有旧的fiber树的话)，生成新的fiber树，拿到更新之后的fiber树，执行渲染任务，更新视图。
