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

### 再优化

还有什么优化空间？

首先通过`Performance`工具获取瀑布流，分析找到可优化空间。

该页面是模块的首页，所以`Performance`工具是测量不出来`FCP`这类指标的，只能手动添加测量指标来衡量优化。

打开该模块实际是通过路由监控来切换JS的，所以自定义衡量指标，就是从点击跳转开始，到页面停止渲染结束：
- 通过`performance.mark`来做一个详细的计算：从新开tab开始到该模块首屏渲染结束。
- 然后观察`Performance`面板或者`Network`面板找到相对耗时严重的资源。

首先观察JS文件，是否有非首屏的，或者资源过大，过大需要适当拆分，拆分就是分文件，将非首屏的JS需要时再引用。
再观察CSS文件，是否有非首屏的，或者资源过大，过大需要适当拆分，拆分就是将非首屏的CSS分到其他文件，不在首屏引用。
然后就是图片资源，观察图片在什么地方用到的，不是特别重要需要预加载的就到需要时再获取。

其次就是接口的优化，不过这个需要后端的配合，毕竟首页有四五个接口获取数据，每个接口都是1-200ms，这样前端再怎么优化能提升的空间也是有限的。

如果接口无法优化，那就是交互上的优化，比如做分步加载，加载出一块就展示一块，这样用户也能尽快看到页面，虽然和页面交互上会差一些。

其他思路：
1. SSR，在后端填充好数据再发送到前端来水合。这里明显不合适，改造代价太大
2. 这里是动态页面，所以SSG(Static Site Generation) ISR(Incremental Static Regeneration增量静态再生)渲染方式都不太合适
3. BFF：主要是前端的数据处理、网络缓存上有优点，这里是接口未优化带来的性能瓶颈，所以也不合适
4. worker：这里没有大量计算，所以也不合适

> [!NOTE]
> 引入BFF主要能起到一些缓存、数据处理的作用，对于接口响应速度是没有提升甚至会损耗的。
