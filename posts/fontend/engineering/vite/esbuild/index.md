---
date: 2025-01-15
title: Esbuild在Vite中的作用
category: engineering
tags:
- fontend
- engineering
- Vite
- Esbuild
description: Esbuild在Vite中的作用
---

# 背景

Vite是基于ESM的构建链，其中用到了Esbuild和Rollup两个打包工具。

## Esbuild是什么

Esbuild是基于Go开发的一款前端打包工具，最大的特点就是整个过程能共享AST，并且语言特性等原因所以很快。

## 在Vite中的作用

### 依赖预构建

Vite是基于ESM的，但是无法保证所有的第三方库都有ESM版本，所以需要有预构建进行处理，而Esbuild又足够的快，所以Vite选择了Esbuild作为预构建工具。

这里的Esbuild起到一个`Builder`的角色。

### 单文件的编译

将ts转成js，但是只做转译工作，没有进行类型检查，只能依赖IDE工具来做类型检查。这个编译是开发和生产环境都会有的。

生产环境在打包之前，会执行`tsc`进行类型检查，防止出错。

这里的Esbuild起到一个`Transformer`的角色。

### 代码压缩

Esbuild还有代码压缩的功能，默认作为生产环境的压缩工具，原因自然也是因为效率够高。

这里的Esbuild起到一个`Minifier`的角色。

### 总结

可以看到，由于Esbuild优越的性能在Vite的整个工作流程中，都有很重要的作用。

但是Esbuild的缺点也很明显，就导致不得不在生产环境使用`Rollup`来进行打包。

- 只支持打包成ES6之后的代码
- 没有提供操作打包产物的接口
- 不支持自定义分包策略
- 社区支持也不够完善

不过好在Vite再向Rolldown转变了，以后应该一个构建工具就可以，不会再有生产和开发环境不一致的问题。


