---
date: 2024-09-19
title: react源码6-context原理
category: react
tags:
- fontend
- react
description: React中context原理分析
---
## context原理介绍

context是React提供的一种将状态存储到顶层的机制，通过该机制可以完成简单的状态管理，比如结合useImmer/发布订阅。

但是context也有一个致命的缺点：context中存了多个数据时，某个中间组件只用了部分数据，但是context更新后，也会导致组件**重刷**。

### 原理

首先简单介绍一下`context`的使用：`createContext`创建一个context对象，然后把管理的状态放到`context.Provider`中，取值时通过`useContext`取值。
`createContext`源码简化后如下：

```js
function createContext(defaultValue) {
  const context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null,
    // 省略其他属性
  }

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  }

  var Consumer = {
    $$typeof: REACT_CONTEXT_TYPE,
    _context: context
  }

  return context
}

```

调用`createContext`方法后会创建一个`context`对象。
然后react处理`Provider`组件时，大致过程是jsx转成render function，执行render function生成vdom即ReactElement对象，通过reconcile转成fiber，之后commit更改页面dom来渲染。在reconcile转fiber过程中会进行处理，将传入的`value`赋值给`_context._currentValue`，这就完成了`context`的更新。
react调用`useContext`时，就是从传入的context对象引用中拿出`_currentValue`值来。

当然在react中context还需要考虑组件边界问题，即上下层的context不能相互影响**(同一个context 多个Provider时)**。
这是通过栈来处理的，`Provider`的`reconcile`过程中，`beginWork`时更新`context`之前有一个`push`操作。等到结束之后`completeWork`时，会有一个`pop`操作。
这样就很好理解了：子组件在取context时，从栈顶取值，保证了一定是离自己最新的context，然后`provider`的`completeWork`时会移除栈顶context，这样其他的子组件并不会被影响到。

