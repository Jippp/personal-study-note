---
date: 2025-03-04
title: context局部状态管理方案
category: workspace
tags:
- workspace
- review
description: 利用context实现局部状态管理方案
---

# 背景

为什么需要局部状态管理？

项目中只有一个全局的Redux，后面单模块内容逐渐变大，如果将状态都放到全局去管理就很不合适了。
所以基于contet搞了一个轻量级的模块内状态管理工具。

## context+useImmer

这一套状态管理工具是基于context来的，虽然很简陋，但是在那时候确实暂时解决了问题的。

### 具体实现

```js
import { createContext, useContext } from 'react'
import { useImmer } from 'use-immer'
export default (defaultContext) => {
  const ctx = createContext({
    store: defaultContext,
    update: () => void 0
  })

  const Provider = ({children}) => {
    const [store, updateStore] = useImmer(defaultContext)

    const ctxValue = useMemo(() => ({
      store,
      update: updateStore
    }), [store, updateStore])

    return <ctx.Provider value={ctxValue}>{children}</ctx.Provider>
  }

  const useCtx = () => {
    return useContext(ctx)
  }

  return [Provider, useCtx]
}
```

实现的很简单，就是将所有的状态以及更新函数保存到Provider中，需要用的时候从`useCtx`中取值或更新。

### 不足

因为是基于context来实现的，所以并没有解决中间组件的不必要渲染，如果模块很大，会有一些不必要的性能开销。

## context+pubsub

该方案是为了解决context中间组件非必要渲染而产生的。

pubsub实现组件级细粒度化的更新

### 具体实现

```js{10-11,18,21,41-42,47}
import { createContext, useContext, useMemo, useEffect } from 'react'
import { Pubsub } from 'pubsub-js'
import { useImmer } from 'use-immer'
import { useMemoizedFn, useForceRender } from 'ahooks'

export default (defaultContext) => {
  const PUB_TOKEN = Symbol()

  const ctx = createContext({
    getStore: () => defaultContext,
    dispatch: () => void 0,
  })

  const Provider = ({children}) => {
    const [store, updateStore] = useImmer(defaultContext)

    useEffect(() => {
      Pubsub.publish(PUB_TOKEN)
    }, [store])

    const getStore = useMemoizedFn(() => store)

    const ctxValue = useMemo(() => ({
      getStore,
      dispatch: updateStore
    }), [getStore, updateStore])

    return <ctx.Provider>{children}</ctx.Provider>
  }

  const useSelector = (selector) => {
    const { getStore } = useContext(ctx)
    const selectorRef = useRef(selector)
    const prevStoreRef = useRef(selector(getStore()))
    
    selectorRef.current = selector
    prevStoreRef.current = selector(getStore())

    const isUpdate = useMemoizedFn(() => {
      const newStore = selectorRef.current(getStore())
      if(Object.is(newStore, prevStoreRef.current)) {
        forceRender()
      }
    })

    useEffect(() => {
      const token = Pubsub.subscribe(PUB_TOKEN, isUpdate)
      return () => {
        if(token) Pubsub.unSubscribe(token)
      }
    }, [isUpdate])

    return prevStoreRef.current
  }

  const useDispatch = () => {
    return useContext(ctx).dispatch
  }

  return { Provider, useSelector, useDispatch }
}


```

1. 不直接将状态放到Provider.value中，而是存一个get函数。需要注意这个get函数的引用值要始终保持不变，这里用了`useMemoizedFn`来处理的
2. 在useSelector中，注册pubSub，回调中去判断状态是否有更新，更新后强制刷新页面。
3. 在Provider中，每次状态变化，都会执行pubSub回调，来判断是否更新强刷页面。

简单点来说就是通过发布订阅，在状态发生变化之后去判断是否更新，更新才刷新当前`useSelector`所在的组件。

> [!NOTE]
> Provider中虽然store变化了，但是真正会触发子组件渲染任务的还是得看`Provider.value`是否变化

简单实现`useMemoizedFn`：
```js
function useMemoizedFn(fn) {
  const fnRef = useRef(fn)
  const memoizedFnRef = useRef(null)

  fnRef.current = fn

  if(!memoizedFnRef.current) {
    // 闭包，每次执行函数时，内部都会访问最新的函数，从而保证内部状态是最新的
    memoizedFnRef.current = function(this, ...args) {
      // apply的目的：1.如果传入的是obj.getName，不处理会导致this丢失 2.参数的正确
      return fnRef.current.apply(this, args)
    }
  }
  return memoizedFnRef.current
}
```

### 不足

对比耗时，可采用浅比较，参考zustand的`useShallow`中的`shallow`

简单点来说就是通过`Object.is`来判断，对`Map、Set、对象`等进行兼容判断处理

最重要的是如果模块内容增多，这种dispatch的更新是难以追踪更新路径的。

## 第三方状态库

虽然能实现局部状态管理，但是轻量级的，存储状态过多，多多少少都会有一些问题，比如上面说的非必要渲染、难以追踪更新路径等问题。

### zustand

#### 简单用法

```js
import { create } from zustand
const useStore = create((set) => ({
  count: 1,
  changeCount: (newCount) => set({ count: newCount })
}))

// 使用
function App() {
  const count = useStore((store) => store.count)
}
```

#### 实现原理

实现原理有点类似Vue3的Proxy响应式，

```js
const create = (creator) => {
  const api = createStore(creator)

  return (selector) => useStore(selector, api)
}

function createStore(creator) {
  let state
  let listeners = new Set()

  setState(newState) {
    if(!Object.is(newState, state)) {
      const prevState = state
      state = newState
      listeners.forEach(listener => listener(state, prevState))
    }
  }
  getState() {
    return state
  }
  subscribe(listener) {
    // listener是react注入的一个callback，接收新旧状态，变化就会触发渲染任务
    listeners.add(listener)
  }

  // 初始化state
  state = creator(setState, getState)

  return { getState, setState, subscribe }
}

function useStore(selector, api) {
  const getState = () => {
    return selector ? selector(api.getState()) : api.getState()
  }

  return useSyncExternalStore(api.subscribe, getState)
}
```

大致原理如上：
- 首先通过create创建一个内存容器，返回值是一个接收`selector`的hook
- 该hook内包含了`useSyncExternalStore`逻辑，即一个状态监听器，如果通过`selector`获取到的状态前后变了，就触发渲染任务
- 在使用时，调用状态更新函数(如changeCount)，会执行内部的`setState`，进而触发设置的监听器，去判断需不需要更新当前组件。

如何实现的组件级渲染：当前组件内通过执行`create`返回的`hook`来获取的状态，执行该hook就相当于添加了一个监听器，等到调用更新函数时，就执行了监听器。这个监听函数是React注入的，大概逻辑就是浅比较前后的状态是否变化，变化就触发一个渲染任务去更新页面。

注意：依赖`useSyncExternalStore`，所以执行`hook`时返回的只能是简单值，如果是引用值，需要添加额外逻辑保证不会死循环。

## 总结

可以看到几种方式其实各有优劣：

- redux：模板代码太多，需要定义一些state、action、reducer等。而且还需要了解这些基本概念才能上手去写代码。但是胜在稳定，并且生态很丰富。
- context：无法追踪更新路径，大模块下很容易管理混乱，经常不知道从哪来的一个变量就更新了。而且也没有中间件等的概念。所以只适用于一些小型模块内的状态共享。
- zustand：生态可能不如Redux。所以适用于一些中大型项目。
