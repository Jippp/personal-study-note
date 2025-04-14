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
