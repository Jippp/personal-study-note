---
date: 2025-01-21
title: 介绍Rollup和简单使用
category: engineering
tags:
- fontend
- engineering
- Vite
- Rollup
description: 介绍Rollup和简单使用
---

## Rollup的介绍和简单使用

### 简介

`Rollup`是基于`ESM`规范实现的`JS打包工具`，因为基于`ESM`的，所以天然是具有`Tree Shaking`功能的。

> [!NOTE]
> 因为`ES`模块是静态解析的，可以在运行前确定依赖关系，与运行时状态无关，所以`Rollup`可以在编译阶段就分析出依赖关系，将AST中没有用到的节点删除，从而实现`Tree Shaking`

```json
{
  // rollup打包命令 -c表示使用配置文件的配置
  "build": "rollup -c"
}
```

### 常用配置

#### 多产物配置

在做第三方库时，可能需要暴露不同格式的产物给别人使用，如`ESM`、`CommonJS`、`UMD`等格式。

```js
/**
 * @type { import('rollup').RollupOptions }
 */
const buildOptions = {
  input: "./src/index.js",
  output: [
    {
      dir: "dist/es",
      format: "esm",
    },
    {
      dir: "dist/cjs",
      format: 'cjs'
    }
  ],
}
```

将`output`配置为一个数组，数组中的每一项就是一个产出

#### 多入口配置

有多产物，就有多入口。类比上面的，就是将`input`配置为一个数组，当然这里还能配置成一个对象

```js
{
  input: ["src/index.js", "src/module.js"],
}
// or
{
  input: {
    index: "src/index.js",
    module: "src/module.js"
  }
}
```

还有另一个复杂的多入口配置，即直接将配置项改成一个数组

```js
/**
 * @type { import('rollup').RollupOptions }
 */
const buildIndexOptions = {
  input: "./src/index.js",
  output: [
    // 产物的配置
  ],
}

/**
 * @type { import('rollup').RollupOptions }
 */
const buildModuleOptions = {
  input: "./src/module.js",
  output: [
    // 产物的配置
  ],
}

export default [buildIndexOptions, buildModuleOptions]
```

#### 常见的output配置

```js
output: [
    {
      // 打包产物输出目录
      dir: "dist/es",
      // names的一些占位符
      // 1. [name]: 去除文件后缀后的文件名
      // 2. [hash]: 根据文件名和文件内容生成的 hash 值
      // 3. [format]: 产物模块格式，如 es、cjs
      // 4. [extname]: 产物后缀名(带`.`)
      // 入口文件打包后产物的文件名
      entryFileNames: `[name].js`,
      // 非入口文件打包后产物的文件名
      chunkFileNames: `chunk-[hash].js`,
      // 静态文件打包后产物的文件名
      assetFileNames: `assets/[name]_[hash][extname]`,
      // 是否生成sourcemap文件
      sourcemap: true,
      // 打包产物的格式`amd`、`cjs`、`es`、`iife`、`umd`、`system`
      format: "esm",
      // 暴露出的全局变量名，是由在打包格式为iife/umd格式才使用
      name: "MyBundle",
      // 声明的一些全局变量
      globals: {
        // 这样声明，就可以用$来替代jquery
        jquery: '$'
      }
    },
],
```

#### external

该配置，是用来将某些不想打包的包剔除出去的，比如下面这样写，react就不会被`Rollup`打包

```js
{
  external: ['react']
}
```

#### 接入插件

```js
import resolve from '@rollup/plugin-node-resolve'
export default {
  // ...省略其他配置
  plugins: [resolve()]
}
```

通过`plugins`配置，可以导入各种插件来增强`Rollup`的功能

常用的插件：

- `@rollup/plugin-node-resolve`：允许加载第三方依赖，如`import react from 'react'`默认Rollup是不能识别的，通过该插件就可以
- `@rollup/plugin-commonjs`：将CommonJS格式的代码转为ESM格式。Rollup默认是不支持输入CommonJS的，所以需要该插件来转化
- `@rollup/plugin-json`：支持`.json`文件的加载，能配合自带的`Tree Shaking`
- `@rollup/plugin-babel`：支持在Rollup中使用Babel进行JS代码的语法转译
- `@rollup/plugin-typescript`：支持在Rollup使用Typescript
- `@rollup/plugin-alias`：支持别名配置
- `@rollup/plugin-replace`：在Rollup中进行变量字符串的替换
- `rollup-plugin-visualizer`：对Rollup打包产物进行分析，自动生成产物体积可视化分析图

### API的方式调用

主要有两个API，`rollup.rollup`以及`rollup.watch`

#### rollup.rollup

该方法是完成一次性打包的

- `rollup.rollup`入参是`inputOptions`配置，生成一个`bundle对象`
- 生成的`bundle对象`有两个方法`generate`和`write`，这两个方法都接收`outputOptions`配置，作用分别是`生成产物`和`写入磁盘`
- 最后调用`bundle.close()`结束这一次打包

```js
/**
 * 通过rollup提供的api，在js文件中手动控制打包
 */

const rollup = require("rollup");

// 常用 inputOptions 配置
const inputOptions = {
  // 当前所在文件的为准的相对路径
  input: "../index.js",
  external: [],
  plugins:[]
};

const outputOptionsList = [
  // 常用 outputOptions 配置
  {
    dir: 'dist/es',
    entryFileNames: `[name].[hash].js`,
    chunkFileNames: 'chunk-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
    format: 'es',
    sourcemap: true,
    globals: {
      lodash: '_'
    }
  }
  // 省略其它的输出配置
];

async function build() {
  let bundle;
  let buildFailed = false;
  try {
    // 1. 调用 rollup.rollup 生成 bundle 对象
    bundle = await rollup.rollup(inputOptions);
    for (const outputOptions of outputOptionsList) {
      // 2. 拿到 bundle 对象，根据每一份输出配置，调用 generate 和 write 方法分别生成和写入产物
      const { output } = await bundle.generate(outputOptions);
      await bundle.write(outputOptions);
    }
  } catch (error) {
    buildFailed = true;
    console.error(error);
  }
  if (bundle) {
    // 最后调用 bundle.close 方法结束打包
    await bundle.close();
  }
  process.exit(buildFailed ? 1 : 0);
}

build();
```

#### rollup.watch

该api用来完成`watch`模式的打包，即每次源文件变动之后自动重新打包。

