---
date: 2025-03-04
title: Vue3基于Proxy的响应式
category: Vue
tags:
- frontend
- Vue
description: Vue3是如何基于proxy涉及的响应式
---

## proxy的用法

```js
const handler = () => {
  get(target, key) {
    console.log('访问属性:', key)
    return target[key]
  },
  set(target, key, value) {
    console.log('修改属性:', key)
    target[key] = value
  }
}

const obj = {a: 1}

const proxyObj = new Proxy(obj, handler)

// 触发get
console.log(proxyObj.a)
// 触发set
proxyObj.a = 2
```

Proxy是js提供的元编程能力的一个api，可以轻松的代理对象属性。

## Vue3如何基于Proxy实现的响应式

### reactive

```js
function reactive(obj) {
  if (typeof target !== "object" || target === null) {
    return target;
  }

  return new Proxy(obj, () => {
    get(target, key) {
      console.log('访问属性:', key)
      return target[key]
    },
    set(target, key, value) {
      console.log('修改属性:', key)
      target[key] = value
    }
  })
}

// 使用
const reactiveState = reactive({ count: 1 })
console.log(reactiveState.count)
reactiveState.count++
```

使用Proxy劫持需要响应式处理的对象，而不是每个属性。对于深层次的属性，会递归处理。并且支持数组的`push、pop`等方法。

### 响应式

Vue3的响应式更新主要有以下的api：
- `reactive`：创建响应式对象
- `effect`：收集依赖，如果内部的响应式状态变化，会自动执行effect回调

```js
const state = reactive({ count: 1 })

effect(() => {
  console.log(state.count)
})

state.count++
```

当执行到`state.count++`时，会自动触发effect的回调。

简单实现：

```js
let effectFn
let trackWeakMap = new WeakMap()

function effect(fn) {
  effectFn = fn
  // 立即执行一次，触发get 收集依赖
  fn()
  // 执行完之后清空
  effectFn = null
}

function reactive(target) {
  if(typeof target !== 'object' || target === null) {
    return target
  }

  return new Proxy(target, () => {
    get(target, key, receiver) {
      // 访问属性时 收集依赖
      track(target, key)
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value) {
      // 更新属性时 根据依赖执行回调
      trigger(target, key, value)
      return Reflect.set(target, key, value)
    }
  })
}

/** 跟踪，get时执行，收集依赖 */
function track(target, key) {
  if(effectFn) {
    const depsMap = trackWeakMap.get(target)
    if(!depsMap) {
      depsMap = new Map()
      trackWeakMap.set(target, depsMap)
    }
    const deps = depsMap.get(key)
    if(!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }
    deps.add(effectFn)
  }
}

/** 触发，set时执行，根据依赖来判断是否要更新effect的回调 */
function trigger(target, key) {
  const depsMap = trackWeakMap.get(target)
  if (!depsMap) return;
  
  const deps = depsMap.get(key)
  if(deps) {
    deps.forEach(fn => fn())
  }
}
```

可以看到原理其实不算难：
1. effect中会访问属性，触发`get`来收集依赖，创建一个`WeakMap<target, Map<key, Set<effectFn>>>`依赖对象
2. 更新状态触发`set`时，就可以通过依赖对象，精确找到需要更新的effect，然后执行即可

## 总结

Vue3使用Proxy，高效的实现了响应式，支持了响应状态动态添加属性。依赖追踪使用`WeakMap+Set`更高效，也能有效减少内存泄露的问题。effect通过Proxy能自动收集依赖，让响应式更加智能高效。
