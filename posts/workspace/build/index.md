---
date: 2025-02-18
title: 大智慧预警通项目中打包优化手段
category: workspace
tags:
- workspace
- review
description: 分析一下预警通项目的打包优化手段
---

# 背景

预警通项目经历约5年时间，从`Webpack`到现在的`Rspack`，打包优化了很多次，这里总结一下。

一开始的`Webpack4`打包会很慢，无论是开发环境还是生产环境，速度都非常的慢，全量构建大概需要十几分钟，生产环境就更别说了，每次Jenkins的流水线都得二十分钟起步。

## 第一阶段的优化 基于webpack的

该阶段优化比较早，都是基于`Webpack`来的，这个阶段是希望通过额外的配置以及工作来减少打包时间。
- 添加缓存，来减少重复打包的时间：
  - `hard-source-webpack-plugin`(已经不维护了)：添加缓存的，将缓存放到`node_modules/.cache/`下，下次打包不用重复构建。
  - 优化`cache-groups`，权衡并包和分包。并包是为了减少网络请求次数，分包是为了防止包过大，响应太慢。
    - `chunks`: `async`、`initial`、`all`。`async`默认值，动态导入的模块会单独打成一个包；`all`是将所有导入的模块都打成一个包；`initial`是所有的都分开打包。
    - `minSize`：最小体积，分包之前会判断该文件大小是不是比这个`minSize`要大，大的话才会打包成单独文件。
    - `maxSize`：最大体积，分包的上限，一般不会设置。默认也是没有上限的
    - `minChunks`：表示在分包之前，最少被多少个`chunk`共享。
    - 优化方向就是尽量减少大的包，比如第三库antd、lodash、ahooks、d3、html2canvas、echarts等基本不会修改的三方库都单独打包了，便于缓存。
  - `dll`找到基本不变的包打成缓存，减少打包时间。
- 开发环境通过自定义脚本对路由文件按需打包
  - 路由文件是分开的，通过重写路由的导入文件(`NormalModuleReplacementPlugin`)，可以实现按需构建。

### 按需构建的步骤

比如路由文件在`src/configs/routes`下

1. 首先执行脚本，读取路由文件夹。比如`routes/bond.ts`下都是债券相关的路由配置
2. 通过读取路由文件名称，`inquirer`工具在cli中选择需要构建的路由
3. 根据选中的路由，通过`ejs`模板重新创建一个新的路由配置文件，比如路径`./src/configs/routes/devRouterConfig.ts`
4. 构建时通过`NormalModuleReplacementPlugin`替换掉原来的路由配置文件：`new NormalModuleReplacementPlugin(new RegExp('./src/routes'), './src/routes/devRouterConfig.ts')`

比如引入是这么写的：
```ts
import routes from '@/configs/routes';
```
所以配置插件时：
```js
new NormalModuleReplacementPlugin(new RegExp('@/configs/routes'), '@/configs/routes/devRouterConfig')
```

> ![!NOTE]
> NormalModuleReplacementPlugin插件的实现原理也很简单，请求时资源时将地址替换一下即可

```js
class NormalModuleReplacementPlugin {
  constructor(regExp, newTarget) {
    this.replaceRegExp = regExp
    this.newTarget = newTarget
  }
  
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('NormalModuleReplacementPlugin', (nmf) => {
      nmf.hooks.beforeResolve.tap('NormalModuleReplacementPlugin', (result) => {
        if (!result) return;
        // Check if the request matches the provided RegExp
        if (this.replaceRegExp.test(result.request)) {
          // If newTarget is a function, call it with the original request
          if (typeof this.newTarget === 'function') {
            this.newTarget(result);
          } else {
            // Replace the request with the new resource path
            result.request = this.newTarget;
          }
        }
      });

      nmf.hooks.afterResolve.tap('NormalModuleReplacementPlugin', (result) => {
        if (!result) return;
        // Check if the request matches the provided RegExp
        if (this.replaceRegExp.test(result.request)) {
          // If newTarget is a function, call it with the resolved request
          if (typeof this.newTarget === 'function') {
            this.newTarget(result);
          } else {
            // Replace the request with the new resource path
            // Ensure `result.resource` is defined before attempting to replace
            if (result.resource) {
              result.resource = result.resource.replace(this.replaceRegExp, this.newTarget);
            }
          }
        }
      });
    });
  }
}
```

该阶段的优化手段说实话 不尽人意，除了开发环境自定义脚本按需打包改善了开发体验，其他的手段提升并不是很多。生产环境全量构建时还是很慢的，Jenkins的流水线还是需要十来分钟才行。

## 第二阶段的优化 构建工具的优化

随着`rsbuild`的正式发布，等到稳定了之后，也换上了`rsbuild`，通过更换打包工具，速度有了极大的提升，之前全量构建十几分钟甚至二十几分钟，现在可能几分钟就够了；再加上开发环境的按需打包，开发效率极大提高了。

因为`rsbuild`直接对接的`webpack`生态，所以改动起来变动并不是很多，但是还是有很多问题的。

- 比如对loader的兼容
  - 内置了很多loader，一些额外的还是要自己安装，比如@rsbuild/plugin-babel @rsbuild/plugin-less @rsbuild/plugin-react @rsbuild/plugin-styled-components
- 比如破坏性的更新
  - 如babel，rsbuild用的swc，迁移的时候就需要对babel兼容。
- 比如不兼容的webpack插件。我们这里没有遇到，`rspack`里对webpack插件做了相当多的兼容。
- 比如分包策略的修改
  - rsbuild内置了一些分包策略，只需要`strategy: split-by-exprience`就可以使用

`rsbuild`以及`rspack`对`webpack生态`做了很多的兼容，所以从webpack项目切换过来还是相对轻松的，至少比vite迁移过来轻松很多。

> [!NOTE]
> rsbuild和rspack的关系就像是vite和rollup的关系，**rspack是构建器**，**rsbuild是构建器之上的工具**。

