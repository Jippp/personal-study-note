---
date: 2025-01-20
title: 分析一道Promise面试题
category: JsBase
tags:
- frontend
- JsBase
- Promise
description: 分析一道Promise面试题
---

# 背景

```js
Promise.resolve().then(function func0() {
  console.log(0)
  return Promise.resolve(4)
}).then(function func4(res) {
  console.log(res)
})

Promise.resolve().then(function func1() {
  console.log(1)
}).then(function func2() {
  console.log(2)
}).then(function func3() {
  console.log(3)
}).then(function func5() {
  console.log(5)
})
```

如上代码会输出什么？

## 分析

模糊点在return一个Promise对象是怎么处理？

return一个Promise，和resolve一个Promise是一样的，都会先处理这个Promise，等到其状态变化之后，再执行后续操作。

也就是说:

```js
Promise.resolve().then(function func0() {
  console.log(0)
  return Promise.resolve(4)
}).then(function func4(res) {
  console.log(res)
})
```

这段代码再解析到`return Promise.resolve(4)`时，会先处理`Promise.resolve(4)`，等其状态变化之后，再执行后续操作。

```js{3}
Promise.resolve().then(function func0() {
  console.log(0)
  return Promise.resolve().then(() => 4).then(x => x)
}).then(function func4(res) {
  console.log(res)
})
```

上面的代码是等同于下面的代码的。

## 结论

通过以上的分析，可以知道，return一个Promise，需要处理该Promise，然后再进行后续操作。

1. 首先微任务队列是空的，然后执行上面代码加入了两个微任务：
```
[
  (function func0() {
    console.log(0)
    return Promise.resolve(4)
  }).then(function func4(res) {
    console.log(res)
  }),
  (function func1() {
    console.log(1) 
  }).then(function func2() {
    console.log(2)
  }).then(function func3() {
    console.log(3)
  }).then(function func5() {
    console.log(5)
  })
]
```
2. 然后取出第一个微任务(上面伪代码中的第一项)执行，先输出了0，然后到`return Promise.resolve(4)`这里，等同于`return Promise.resolve().then(() => 4).then(x => x)`，所以又加入一个微任务。

```
[
  (function func1() {
    console.log(1) 
  }).then(function func2() {
    console.log(2)
  }).then(function func3() {
    console.log(3)
  }).then(function func5() {
    console.log(5)
  }),
  (() => 4).then(x => x).then(function func4(res) {
    console.log(res)
  }),
]
```

3. 然后再取出第一个微任务(上面伪代码中的第一项)来执行，输出了1
```
[
  (() => 4).then(x => x).then(function func4(res) {
    console.log(res)
  }),
  (function func2() {
    console.log(2)
  }).then(function func3() {
    console.log(3)
  }).then(function func5() {
    console.log(5)
  }),
]
```

4. 然后再取出第一个微任务(上面伪代码中的第一项)来执行，执行时又追加了一个微任务，所以微任务队列如下：
```
[
  (function func2() {
    console.log(2)
  }).then(function func3() {
    console.log(3)
  }).then(function func5() {
    console.log(5)
  }),
  (x => x).then(function func4(res) {
    console.log(res)
  }),
]
```

5. 然后再取出第一个微任务(上面伪代码中的第一项)来执行，输出了2
```
[
  (x => x).then(function func4(res) {
    console.log(res)
  }),
  (function func3() {
    console.log(3)
  }).then(function func5() {
    console.log(5)
  }),
]
```

6. 然后再取出第一个微任务(上面伪代码中的第一项)来执行，执行时又追加了一个微任务，所以微任务队列如下：
```
[
  (function func3() {
    console.log(3)
  }).then(function func5() {
    console.log(5)
  }),
  function func4(res) {
    console.log(res)
  }
]
```

7. 然后再取出第一个微任务(上面伪代码中的第一项)来执行，输出了3
```
[
  function func4(res) {
    console.log(res)
  },
  (function func5() {
    console.log(5)
  }),
]
```

8. 然后再取出第一个微任务(上面伪代码中的第一项)来执行，输出了4
```
[
  (function func5() {
    console.log(5)
  }),
]
```

9. 最后一次，输出5

## 总结

在Promise中，return或者resolve一个Promise对象时，会先处理该Promise对象，等到状态变化之后再继续处理。

```js{2,9}
Promise.resolve().then(() => {
  return Promise.resolve(1)
}).then(res => {
  console.log(res)
})

// 等同于
Promise.resolve().then(() => {
  return Promise.resolve().then(() => 1).then(x => x)
}).then(res => {
  console.log(res)
})
```

会多出来两次微任务。
