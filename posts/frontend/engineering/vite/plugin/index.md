---
date: 2025-01-22
title: Vite的插件机制
category: engineering
tags:
- frontend
- engineering
- Vite
description: Vite的插件机制
---

# 背景

Vite是双引擎架构，开发阶段主要用的是Esbuild，生产阶段主要用的是Rollup。但是Vite的插件机制是基于Rollup的：**生产环境直接用Rollup的插件机制，开发环境模拟Rollup插件机制完成工作的**。

## 工作原理

在开发环境由于Rollup是没有开始工作的，所以Vite只能通过**模拟Rollup插件机制**来完成工作。具体是设计了一个 **`PluginContainer`对象**来调度插件。

### 插件容器 PluginContainer

插件容器主要负责实现Rollup插件hook的调度，并实现了插件hook内部的Context上下文对象。

简单来说就是通过定义一些函数来模拟Rollup插件的hook，让他们运行起来和Rollup提供的hook一样，就可以实现模拟Rollup插件的目的。这些定义的函数，就是`PluginContainer`插件容器。

因为只是模拟，所以或多或少的有一些差异，比如开发阶段`PluginContainer`只提供了部分的hook，而生产阶段Rollup提供了更多的hook。

## Vite插件

### 基本格式

```js
function testPlugin(pluginOptions) {
  // pluginOptions是插件的配置项 使用时传入
  return {
    name: 'test-plugin',
    load() {
      // 逻辑
    }
  }
}
```
和Rollup插件格式是一样的，都是一个对象，并且有一个name属性声明插件的名称，然后是一些hook函数。

> [!NOTE]
> 这里通过工厂函数来定义，是为了方便传入配置项，比如`pluginOptions`。

### 插件的hook

#### 兼容Rollup的hook

在**开发阶段**，Vite是通过模拟Rollup来实现插件的。所以开发阶段的一些hook都是兼容Rollup的。

- 服务器启动：`options`和`buildStart`这两个hook
- 请求相应：`resolveId`、`load`、`transform`这三个hook
- 服务器关闭：`buildEnd`和`closeBundle`这两个hook

#### Vite特有的hook

Vite插件也有一些特有的hook，这些hook是不兼容Rollup的。

##### `config`hook

Vite读取完配置文件之后调用，可以在这里修改配置

```js
const configHookPlugin = () => {
  return {
    name: 'config-hook-plugin',
    // 1. 直接返回一个对象，该对象是部分配置项，vite会合并到最终的配置中
    config: () => ({
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }),
    // 2. 也可以返回一个函数，该函数接受两个参数，config和env
    config(config, env) {
      // config是解析后的配置文件
      // env是当前的环境变量
      console.log('config', config)
      console.log('env', env)
    }
  }
}
```

##### `configResolved`hook

Vite在解析完所有的配置之后调用，在`config`hook之后，一般用来记录最终的配置信息。

```js
const configResolvedHookPlugin = () => {
  // 通过全局对象，可以在其他地方访问配置对象。
  let resultConfig;
  
  return {
    name: 'config-resolved-hook-plugin',
    configResolved(config) {
      // config是解析后的配置文件
      console.log('config', config)
      resultConfig = config
    }
  }
}
```

##### `configureServer`hook

开发阶段的，用来配置dev server的hook。

##### `transformIndexHtml`hook

在开发阶段，Vite会将`index.html`文件作为入口文件，然后通过该hook来对`index.html`文件进行处理。

```js
const htmlPlugin = () => {
  return {
    name: 'html-plugin',
    transformIndexHtml(html) {
      // html是index.html文件的内容
      // 可以在这里对html文件进行处理
      console.log('html', html)
      return html.replace(/<title>(.*?)<\/title>/, '<title>Hello World</title>')
    }
  }
}

```

##### `handleHotUpdate`hook

Vite服务端处理热更新时调用，可以通过该hook拿到热更新相关的上下文信息，进行热更新模块的处理。

### 插件的执行顺序

想要知道插件的执行顺序，可以通过一个简单的demo来判断。

```js
const pluginOrder = () => {
  return {
    name: 'plugin-order',
    // Vite独有的
    config() {
      console.log('plugin-order config')
    },
    // Vite独有的
    configResolved() {
      console.log('plugin-order configResolved') 
    },
    // 通用
    options() {
      console.log('plugin-order options')
    },
    // Vite独有的
    configureServer() {
      console.log('plugin-order configureServer')
    },
    // 通用
    buildStart() {
      console.log('plugin-order buildStart')
    },
    // 通用
    buildEnd() {
      console.log('plugin-order buildEnd')
    },
    // Vite独有的
    handleHotUpdate() {
      console.log('plugin-order handleHotUpdate')
    },
  }
}
```

通过上面的demo，可以看到插件的执行顺序是：

- 在服务启动阶段：`config` -> `configResolved` -> `options` -> `configureServer` -> `buildStart`
- 在请求响应阶段：html文件，执行`transformIndexHtml`，js文件；执行`resolveId` -> `load` -> `transform`
- 在服务关闭阶段：`buildEnd` -> `closeBundle`
- 热更新时：`handleHotUpdate`

### 插件执行位置

虽然插件的执行是有一定顺序的，但是可以通过配置，来改变插件的执行位置或者环境。

#### apply属性

默认在开发环境和生产环境都会执行插件，可以通过`apply`属性来控制插件的执行环境。

```js
const demoPlugin = () => {
  return {
    name: 'demo-plugin',
    // server：开发环境；build：生产环境
    apply: 'serve',
  }
}
```

#### enforce属性

默认插件是按照插件的顺序来执行的，可以通过`enforce`属性来控制插件的执行顺序。

```js
const demoPlugin = () => {
  return {
    name: 'demo-plugin',
    // 默认normal；pre：在其他插件之前执行；post：在其他插件之后执行
    enforce: 'pre',
  }  
}
```
