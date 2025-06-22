---
date: 2025-06-22
title: single-spa介绍
category: MicroFrontend
tags:
- frontend
- MicroFrontend
description: 入门Single-Spa
---

## single-spa是什么？

从名字可以看出，是专门用于构建微前端架构的单页应用（SPA）框架：支持多个**框架无关**的子应用接入到一个整体中。

首先整体的架构中存在一个主应用以及多个子应用。在主应用中可以根据**路由**来切换子应用，实现类似MPA的效果。

存在一个主应用：
- 需要在主应用中**注册子应用**以及对应需要挂载的DOM容器
  - 注册时至少要有三个东西：name唯一标识、如何加载子应用的逻辑(app)、能确定子应用状态的逻辑(activeWhen)
- 需要有一个**导航/路由机制**来切换子应用，可能是一个路由对应一个子应用

存在多个子应用：
- 子应用需要抛出几个生命周期钩子，这样主应用才能处理子应用
- 子应用和框架无关
- 需要构建出特殊的产物，才能让主应用识别和处理

首次激活时，遍历子应用判断(`activeWhen`)是否需要激活，执行需要激活的子应用的加载逻辑(`app`)，解析子应用的生命周期(bootstrap、mount等)；

卸载时，判断子应用是否需要卸载，然后执行需要卸载的子应用的卸载逻辑，执行对应生命周期钩子(unmount)；

再次激活时，还需要遍历子应用判断是否需要激活，执行需要失活的子应用的unmount，然后执行需要激活的子应用的mount；

> [!NOTE]
> 需要注意`single-spa`**没有做隔离和性能优化**，所以`qiankun`在此基础上封装了一层。

### 类型

`single-spa`中根据子应用可能的类型分为了三类：
- `Applications`：根据路由来渲染子应用的微前端类型，依赖路由的，可以看做是应用中的一个页面。
- `Parcels`：非路由形式来渲染子应用的微前端类型，可以看做是UI组件。
- `Utility Modules`：子应用是纯逻辑的微前端类型。

> [!NOTE]
> 这三种类型并没有什么实际意义，**只是一个概念**

## single-spa的运行机制？

### 核心API

#### 注册

`single-spa`通过`registerApplication`api来注册子应用，有两种传参的形式：
- `registerApplication(name, app, activeWhen, customProps)`
- `registerApplication({ name, app, activeWhen, customProps })`

`getAppStatus(appName)`：获取指定应用的状态

`getMountedApps()`：获取已经mounted的应用name

#### 生命周期管理相关

`start`: 启动，会初始化路由系统并开始监听url变化

#### 错误处理

`addErrorHandler`：添加监听器

`removeErrorHandler`：移除监听器

### 生命周期

正常的`spa`在浏览器访问对应地址时激活了应用，关闭浏览器标签页就是应用失活，浏览器处理了应用的加载和卸载。
但是在微前端中，需要通过主应用来控制，一般是路由变化才去加载对应的子应用。所以主应用需要控制子应用的渲染、加载、卸载等过程，所以才需要在子应用中添加各种生命周期，以便主应用的控制。

- `bootstrap`：子应用初始化时执行一次，后续重复加载不会执行
- `mount`：子应用每次加载都会执行
- `unmount`：子应用卸载时执行

> [!NOTE]
> 需要注意，`single-spa`中强制要求生命周期一定是**异步函数**，所以要加`async`

### 子应用的构建

因为子应用实际是需要被主应用消费的，所以产物可能需要满足某种“格式”后主应用才能识别和处理。

- 主应用中**动态import**npm包形式的子应用：该子应用的产物需要是单个`JS Bundle`形式，并且内联了CSS。**生命周期**直接模块化导出即可。
- 主应用中通过**动态script(动态import远程资源)**注册的子应用：产物需要是单个`JS Bundle`形式，需要内联CSS。然后还需要通过全局变量来获取**生命周期**。
- 主应用中通过**fetch**获取远程资源形式的子应用：产物要求同上。

> [!NOTE]
> 当然并不是说一定要是单个包的形式，如果经过code-split将依赖拆分开来的话，需要自己手动控制依赖的加载顺序，加载逻辑会非常的负复杂。

### 路由系统

是如何监听URL，以及URL变化后怎么实现切换子应用的？

首先重写了`pushState`以及`replaceState`方法，然后通过`hashChange`以及`popState`事件来监听URL的变化。

监听到变化之后，会通过传入的`activeWhen`配置项来找到需要处理(加载、挂载、取消挂载、卸载)的子应用，以此来实现的路由处理。

## demo演示

### 动态import引入npm包形式的子应用

主应用改造：
1. 安装`single-spa`
2. 入口`src/index.js`注册子应用，其中`app`配置是动态import引入npm包
3. 需要有一个容器区域来展示子应用

```js
registerApplication({
  name: 'app1',
  app: () => import('app1'),
  activeWhen: (location) => location.pathname.startsWith('/app1'),
})
```

子应用改造：
1. 入口`src/index.js`中抛出`bootstrap\mount\unmount`等必须的几个生命周期钩子
3. 构建：产物一般`commonjs`格式的，因为可以通过模块化方式被主应用引入；不进行chunk分离，所有依赖都在一个文件中，并且css也是被内联的；
4. package中不能有`type: module`，否则会被主应用当做是esm格式的，从而解析失败；并且`main`字段要指向产物`js`
