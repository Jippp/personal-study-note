---
date: 2024-12-19
title: npm方案实现微前端
category: MicroFontend
tags:
- fontend
- MicroFontend
description: 通过npm来实现微前端以及优缺点
---

# npm方案的微前端

该方案实现起来也很简单。将微应用打包成npm包托管到npm仓库，然后在主应用中通过npm安装使用即可。

但是有几点问题：
1. 使用时是直接引入的，所以微应用就不能很大，因为需要的是单个JS文件，如果微应用很大这个文件就会很大，会有一些加载性能问题。

> [!NOTE] 为什么需要单个JS文件
> 因为是通过内部抛出的一些约定好的方法(如mount unmount)来控制微应用的，否则的话主应用是没有办法控制微应用的。

2. 如果微应用更新了，主应用也需要更新，就很麻烦

3. 微应用之间的通信也是一个问题

4. 无法tree-shaking，会导致主应用打包后的文件很大。

所以npm方案只适合一些小型的微应用，并且实际不可能使用这种方式来实现微前端的，这里只做一个了解。
