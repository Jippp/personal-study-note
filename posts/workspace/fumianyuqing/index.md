---
date: 2025-02-13
title: 大智慧预警通项目中负面舆情指数需求的复盘
category: workspace
tags:
- workspace
- review
description: 复盘负面舆情指数需求，找到问题，复盘和总结
---

# 需求背景

该需求是一个专题类型的，主要页面就是左侧目录树+右侧的展示区域。该需求没有太大的难点。

## 难点和总结

该需求之所以总结，是因为用到了`Promise.allSettled()`api，所以拿出来总结一下。

使用该api的背景：表格数据是由好几个接口返回值拼接成的，如果接口失败自然不能影响到其他的表格展示。

该场景下使用`Promise.allSettled()`api就刚刚好，因为它不会因为状态还有变化，返回的数组包含失败或成功的。可以根据这个状态来判断是否需要拼接进数据中。

```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then((results) => {
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      console.log(result.value); // 1, 3 
    }   
    if (result.status === 'rejected') {
      console.log(result.reason); // 2
    }
  }) 
})
```

根据`status`状态的`fulfilled`或者`rejected`来判断是否成功。

### 懒加载优化首页

问题背景：首页有很多表格，一页是放不下的，而且一个表格的数据是有三个接口拼接成的，不做任何处理的话进入首页就会并发很多请求，还会导致页面响应过慢。

优化方案：通过InteractionOberser来判断可见性，不可见的不加载。进入视口之后再去加载数据。

优化成果：经过多次Performance的测量
- INP(Interaction to Next Paint 下一次绘制后的可交互时间)测量的是全部交互的全部延迟。从300+ms降低到了50ms左右，提高了80%以上
