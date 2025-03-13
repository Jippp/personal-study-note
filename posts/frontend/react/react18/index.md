---
date: 2025-02-27
title: React18的新特性
category: react
tags:
- frontend
- react
description: 了解React18的新特性
---

# React18

## 并发ConCurrent

React18最重要的更新内容就是并发。

> [!NOTE]
> 虽然有很多个任务在执行，但是同一时间只能有一个任务正在被执行。关键是处理多任务的能力。

首先思考一个问题，React16就已经引入了Fiber，React17也添加了时间切片，为什么React18中的并发这么重要呢？

React17中“中断“渲染，更多指的是时间切片，是将长任务的渲染改成了可“中断”的渲染任务，但是对于整个渲染流程并不是中断的。只是将原来的长任务切分成了多个短任务来执行，本质上还是不可中断渲染的。如果页面某个元素渲染过程过长，页面其他地方更高优先级的渲染任务是无法执行的。

React18的并发就是可中断渲染，在一次渲染过程中，原来的渲染任务可以被更高优先级的渲染任务中断。本质上是对优先级调度的一次更新。

并发的原理是通过调整更新任务的优先级，使得时间分片中断后取到高优先级任务，从而实现的并发。

> [!NOTE]
> 这里的中断并不是主动打断渲染，而是React时间分片是每隔5ms自己中断重新从小顶堆中取任务来执行，以此来实现的中断。

### 更新优先级

虽然React17就有了优先级的概念，但是并没有提供修改优先级的方法，也就意味着所有的渲染都是同优先级的，所以无法中断渲染。

紧急更新以及过渡更新

- 紧急更新(Urgent updates)：一般是用户交互类的更新，如click、input等直接影响到用户和页面的交互。
- 过渡更新(Transition updates)：可以简单理解为不紧急的更新。
比如页面上有一个输入框和列表，列表在渲染时，输入框时无法交互的。输入框的交互就属于紧急更新，列表渲染就是过渡更新。

> [!NOTE]
> 当然源码中对优先级的划分更加细化，这里只是简单举个例子。

### 并发的相关API

#### useTransition/startTransition

用法：包裹更新状态的函数，此状态触发的更新任务会比正常任务的优先级低一点。

```jsx
import { Children, useState, useTransition } from 'react'

function App() {
  const [tab, setTab] = useState('normal')

  return (
    <>
      <TabBtn action={() => setTab('normal')}>NormalTab</TabBtn>
      <TabBtn action={() => setTab('slow')}>SlowTab</TabBtn>

      {
        tab === 'normal' 
          ? <div>normal tab content</div>
          : tab === 'slow' ? <SlowTab />
          : null
      }
    </>
  )
}

function TabBtn({
  children, action
}) {
  const [isPending, startTransition] = useTransition()

  if(isPending) return <button>isPending</button>
  return (
    <button 
      onClick={() => {
        startTransition(() => {
          action()
        })
      }}
    >{children}</button>
  )
}

function SlowTab() {

  const start = Date.now();
  while (Date.now() - start < 2000) {}

  return (
    <>slow tab content</>
  )
}

export default App

```

原理：执行`startTransition`时修改当前任务的优先级即可，scheduler调度时会根据优先级来排序

#### useDeferredValue

用法：包裹一个状态，可以获取该状态的延迟版本。
比如搜索和展示列表的，搜索框内的需要最新输入状态，但是展示列表可以用上一次的搜索值，直到最新结果返回。

原理：

- 挂载时：直接将状态值返回即可
- 更新时：判断当前渲染任务的优先级(比如useState分发的dispatch，其中会根据当前fiber来分发优先级，`并发模式下默认SyncLanes`)，如果是高优先级的渲染任务，会将当前渲染任务优先级调低，以此来实现延迟更新，并从`上一次hook.memoizedState`中取出旧值返回。等到所有的高优先级渲染任务执行完之后，再执行这里的低优先级渲染任务，将新值返回即可。

简单概括：通过调整渲染任务的优先级来延迟返回最新的状态值

### 并发模式对useEffect的影响

React17之前，useEffect回调是在页面渲染完成之后异步调用的。但是React18的并发模式给useEffect回调的执行带来了一些新的变化。

因为并发模式可能会抛弃掉一些不必要的更新，所以那些更新导致的useEffect也可能是没用的，进而导致useEffect可能会不执行。

## 更多的批处理

某个函数内触发了多次渲染，React会将其合并为一次渲染，这就是批处理。

React17的批处理很简单，仅在事件处理函数中进行了批处理，一些setTimeout的回调、promise的回调等是不会有批处理的。

而React18增强了批处理，setTimeou回调、promise回调、原生事件的回调等都增加了批处理机制。

### 如何取消批处理

`react-dom`提供了一个`flushSync`函数，使用该函数可以退出批处理

```js
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCount(d => d + 1)
  })
  setText('123')
}
```

## transition过渡更新

引入了几个优先级相关的api：`useTransition、startTransition、useDeferredValue`

## 增强Suspence

React17中，Suspence主要和懒加载配合实现代码分割的，在React18中新增了fallback属性，可以捕获到子组件抛出的Promise，进而渲染备用页面，减少了loading等状态的管理。

## 新增hook

### useSyncExternalStore

提供的一个可以订阅组件外部数据的hook

```js
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```
- `subscribe`： 订阅外部数据的方法，并且应该返回一个取消订阅的函数。
- `getSnapshot`：获取快照。即获取状态的，如果通过该函数获取到的状态发生了变化，就强制渲染视图
- `getServerSnapshot`：服务端获取快照

```js
const getSnapshot = () => {
  return navigator.onLine;
}
const subscribe = (callback) => {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}
export default () => {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot)
  return <h1>{isOnline ? "✅ Online" : "❌ Disconnected"}</h1>;
}
```

提供的`subscribe`方法中监听了`online以及offline`，当变化时执行`callback`，该`callback`是react注入的，会比较前后`getSnapshot`拿到的值是否相等，不相等强制推入一个渲染任务。

所以使用时需要注意：
- `getSnapshot`返回值要注意，很容易导致死循环：如果返回的是引用值，执行会返回一个新的引用，触发渲染任务。渲染时又调用该函数，返回新引用又再次触发了渲染任务。
- `subscribe`需要返回一个清空监听器的函数

原理：

基于`useEffect`实现

- 挂载时
  - 通过`getSnapshot`拿到初始值，放到`hook.memoizedState`中，将`值以及getSnapshot`放到`hook.queue`
  - 在`mountEffect`中监听，`subscribe`方法增加一个**handleStoreChange方法**，该方法中判断值变化就`强制刷新页面`，实际是触发一个`SyncLanes`优先级的渲染任务。
- 更新时
  - 基本上是相同的逻辑
  - 从旧fiber节点中取旧值，通过`getSnapshot`拿新值，判断是否变化
  - 在`updateEffect`中添加监听，和上面一样

可以看到不管是mount还是update，都会调用`getSnapshot`获取新值去判断，如果`getSnapshot`直接返回引用值就会导致无限循环。
