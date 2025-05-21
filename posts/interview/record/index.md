---
date: 2025-04-14
title: 正常的面试记录与复盘
category: interview
tags:
- interview
description: 正常的面试记录与复盘
---

## pdd

### 一面(2025-4-13)

一面主要是了解基本情况，写了三道题基本就结束了。

- 实现一个`useAsync`

```js
const useAsync = (asyncFn) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [data, setData] = useState([])
  const asyncFnRef = useRef()
  const runRef = useRef()

  // 防止闭包中引用的是旧值
  asyncFnRef.current = asyncFn

  if(!runRef.current) {
    runRef.current = async(params) => {
      try {
        setIsLoading(true)
        setError(false)
        const res = await asyncFnRef.current(params)
        // 根据实际情况来 不过JSON比较常见
        const result = await res.json()
        setIsLoading(false)
        setData(result)
      }catch(err) {
        setIsLoading(false)
        setError(err)
      }
    }
  }

  return { isLoading, error, data, run: runRef.current }
}

// 使用

const App = () => {
  const { isLoading, error, data, run } = useAsync(() => {
    return fetch('xxx')
  })
}
```

- 对象key的转化

```js

function getType(target) {
  return Object.prototype.toString.call(target)
}
function isObject(target) {
  return getType(target) === '[object Object]'
}
function isArray(target) {
  return getType(target) === '[object Array]'
}
function isObjectOrArray(target) {
  return isObject(target) || isArray(target)
}

function toCamel(key) {
  return key.split('-').map((item, idx) => {
    return idx ? `${item[0].toUpperCase()}${item.slice(1)}` : item
  }).join('')
}

function objKeyToCamelAll(target) {
  if(!isObjectOrArray(target)) return target
  let result
  if(isArray(target)) {
    result = target.map(item => isObjectOrArray(item) ? objKeyToCamelAll(item) : item)
  }else {
    result = {}
    // 对象
    Object.keys(target).forEach(key => {
      const item = target[key]
      result[toCamel(key)] = isObjectOrArray(item) ? objKeyToCamelAll(item) : item
    })
  }
  return result
}

console.log(objKeyToCamelAll({
  'since_id': 1,
  { 'obj_key': 2 }
}))

// 进阶：考虑数组中包裹了对象

```

- 算法：回溯

```js
/*
  给一个n，考虑有效括号的集合
  n=1 ['()']
  n=2 ['(())', '()()']

  思路：回溯 每次尝试加一个'('和')' 然后判断是否是有效括号的集合即可
  终止条件：字符串长度是n的两倍
  因为需要有效括号，所以先加'(' 直到open>=n 再加')'
  所以有一个open记录正括号的数量，一个close记录反括号的数量
  open>=n 时再加')' 并且close的数量要小于open，不能等于 如果加了等于的条件会再加一次')'
*/
function run(n) {
  const result = [];

  function backtrack(s = '', open = 0, close = 0) {
    if (s.length === n * 2) {
      result.push(s);
      return;
    }

    if (open < n) {
      backtrack(s + '(', open + 1, close);
    }

    if (close < open) {
      backtrack(s + ')', open, close + 1);
    }
  }

  backtrack();
  return result;
}

```

### 二面(2025-04-20)

也比较快，大概三十多分钟四十分钟结束。

- 组件库

- 倒计时组件：1.倒计时 2.时间格式转化

- promise超时机制

- 分享的babel，工作中有用到吗

- 分享的react优化

- 从url输入到页面显示

- async和defer的作用

- 离职原因？工作节奏？

### 三面(2025-04-23)

- 大整数相减：边界值没考虑清楚，最后没做出来

```js
function isSmaller(a, b) {
  return a.length < b.length || (a.length === b.length && a < b)
}

function bigIntSubtract(a, b) {
  const result = []
  let isNegivate = false
  if(isSmaller(a, b)) {
    // 找到较大的值交换位置，保证a始终较大
    isNegivate = true;
    [a, b] = [b, a]
  }

  let i = a.length - 1
  let j = b.length - 1
  let temp = 0
  while(i >= 0 || j >= 0) {
    let cur = Number(a[i] || 0) - temp - Number(b[j] || 0)
    if(cur < 0) {
      cur += 10
      temp = 1
    }else {
      temp = 0
    }
    result.unshift(cur)
    i--
    j--
  }

  // 可能有前置0，去掉
  while(result[0] === 0 && result.length) {
    result.shift()
  }

  return `${isNegivate ? '-' : ''}${result.join('')}`
}
```

- 后面随便问了几题，http状态码的含义、项目中的技术难点

### HR面

主要是基本情况的了解

找机会原因、新公司期望、薪资情况、工作地点能不能接受等

## 腾讯子公司 瑞德铭

### 一面(2025-4-9)

主要是基础+项目，问的还是比较简单的，都是一些基础的问题。

写题：实现一个search组件，主要是onChange方法，注意防抖+请求数据处理。

### 二面(2025-4-15)

上来就是算法：
1. 找数组中重复值，比较简单，用一个set就行了
2. 滑动窗口：从数组中找出一个连续子数组，满足子数组的和大于等于一个值s
```js
function minSubArrayLen(nums, s) {
  if(!nums.length.length) return []

  // 定义窗口的两端
  let start = 0
  let end = 0
  let sum = 0
  let minLen = nums.length
  let result = []
  while(end < nums.length) {
    sum += nums[end]

    // 判断窗口缩小的时机
    while(sum >= s) {
      if(end - start + 1 < minLen) {
        // 新的最小值记录此时的连续子数组
        minLen = end - start + 1
        result = nums.slice(start, end + 1)
      }
      sum -= nums[start]
      start+=
    }

    // 扩大窗口
    end++
  }

  return result
}
console.log(minSubArrayLen([2, 3, 1, 2, 4, 3], 7)); // 输出：[4, 3]
```

> 面试的时候磨蹭了半天，最后还是暴力解：把全部结果都收集起来，然后找最小长度的。

后面就是自我介绍+项目了

性能优化怎么做的，如果现在再优化有什么思路？
还有一些项目强相关的，比如多平台兼容怎么做的？

后面就是开放题：优点是什么？工作中和AI的结合？怎么学习？最近学了什么？

## 富途

### 一面(2025.5.15)

问的比较基础，都是一些八股相关的，项目问的也比较笼统

印象深刻的题目：

- 项目中难点

- 技术选型

- 浏览器渲染流程以及js怎么解析

- 事件循环

### 二面(2025.5.21)

问的是一些思维性的问题

- 在公司的定位

- 同事眼中的你

- 你觉得自己的定位

- 你觉得自己的优势在哪

- 有挑战性的工作内容

- 九宫格，从左上角到右下角的路径有多少种

- 数学问题：一个桶中有100个黑球和100个白球，每次拿2个球，如果2个球颜色相等放一个黑球进桶，如果颜色不同放一个白球进桶。最后桶中还剩一个球时，是白球的可能性有多大

- 算法：n*m的数组，从左上角到右下角时，路径和最短的值

