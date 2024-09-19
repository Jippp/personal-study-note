---
date: 2024-09-19
title: react源码4-状态更新
category: react
tags:
- fontend
- react
description: React状态更新的流程分析
---
## 状态更新流程

> 在reconciler中会通过`beginWork`和`completeUnitOfWork`来生成一个新的`Fiber树`，其中经历了`状态更新流程`、`diff`才生成的树形结构，最后交给`renderer`渲染器进行渲染

### 概览

在`React`使用中可以通过以下几种方式来触发更新(忽略`class`版本的)：

- `ReactDOM.render/ReactDOM.createElement().render`：这是初始化`React`，也是会触发更新的。
- `useState`：底层和`useReducer`调用的是一个东西，可以看做是一个特殊的`useReducer`
- `useReducer`

> 多种方式触发更新，每次触发状态更新，都会创建一个保存更新状态相关的`Update`对象，这个对象是挂载在要更新的fiber节点上的。

之前的`render阶段`是从`fiber根节点`开始向下遍历的，而更新时的`Update对象`是保存在其子节点上的，`React`中通过调用某个方法从当前的子节点找到`fiber根节点`（该方法中会向上遍历直到找到`根节点`，并返回根节点）。

在根节点对应的`Fiber树`中某个节点是包含这个`Update`对象的。然后进入`Scheduler`根据更新的`优先级`，判断`同步还是异步`来调度更新。

> 这里的判断封装在`ensureRootIsScheduled`函数中，然后作为参数传给`Scheduler`暴露的函数，这样子连接的`reconciler`以及`scheduler`

### Update对象

上面说到有两种方式来触发更新，按照这两种更新方式Update对象可以分为两类：

- `render`对应的一种Update对象结构
- `Hook`对应的另一种Update对象结构

#### `render`的`Update`对象

这个`Update`对象是由`createUpdate`方法创建的：

```js
export function createUpdate(eventTime: number, lane: Lane): Update<*> {
  const update: Update<*> = {
    eventTime,
    lane,

    tag: UpdateState,
    payload: null,
    callback: null,

    // 重点关注这个，与其他Update对象形成链表结构。
    next: null,
  };
  return update;
}
```

可以看到该对象上有个`next`属性，`Fiber节点`上多个`Update对象`会通过该属性连成`链表结构`保存到`fiber.updateQueue`上。

> 多个Update对象，在批量更新等情况会出现，即多次执行更新函数

因为对象是保存在`fiber节点`上的，`双缓存`会同时存在两颗`Fiber`树，所以也会同时存在两个`updateQueue`。

##### `updateQueue`类型

`updateQueue`也是有类型的，是通过下面的工厂函数来创建的：

```js
export function initializeUpdateQueue<State>(fiber: Fiber): void {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
      interleaved: null,
      lanes: NoLanes,
    },
    effects: null,
  };
  fiber.updateQueue = queue;
}
```

可以看到最后挂载到了`fiber.updateQueue`上。

其他属性介绍如下：

- `baseState` 更新前该`fiber节点`的`state`，基于此来计算更新后的`state`

- `firstBaseUpdate、lastBaseUpdate`更新前该`fiber节点`就已经存在的`update对象`。链表形式存在，以`fistBaseUpdate`为链表头，`lastBaseUpdate`为链表尾。

  > 更新前就存在是某些优先级较低，所以上一次`render`被跳过了。

- `shared.pending`：更新时，生成的`update对象`会保存在这里形成`单向环形链表`

- `effects`：如果`update.callback`有值就会保存在这里。

##### 举例说明

