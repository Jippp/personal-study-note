---
date: 2025-06-22
title: qiankun入门介绍
category: MicroFrontend
tags:
- frontend
- MicroFrontend
description: qiankun入门相关介绍
---

## 简介

是在`single-spa`基础上的一个库，添加包括CSS、JS在内的隔离方案以及性能优化处理，是一个可以实现完备的微前端方库的工具库。

## 使用

主应用：
1. 安装`qiankun`
2. 注册子应用，如果和路由有关在入口通过`registerMicroApps`以及`start`来使用；如果和路由无关使用`loadMicroApp`注册。**可以混用**

子应用：
1. 在入口(渲染的地方)向主应用抛出几个钩子：`bootstrap`、`mount`、`unmount`、`update`
  - `bootstrap`：初始化时调用，后续重新进入不调用
  - `mount`：每一次进入都会调用
  - `unmount`：每一次退出时调用
  - `update`：仅`loadMicroApp`时生效，用来更新子应用的，因为`loadMicroApp`会返回子应用实例，可以调用该函数执行更新逻辑。
2. 构建工具的配置修改
  - 为了让主应用能识别到信息，所以配置要修改
  - webpack的output配置

可以看到有两种方式来使用：**基于主应用路由**的以及**手动加载**的。

在`single-spa`中，需要**手动**处理子应用的加载逻辑(如何执行)`app配置项`以及如何识别生命周期。
但在`qiankun`中不需要处理子应用的加载逻辑以及如何识别生命周期，只需要提供`entry子应用入口`以及`container子应用挂载的节点`即可实现一个微前端方案。在`qiankun`内部会自动请求、执行子应用的脚本，并自动识别出子应用的生命周期。

> [!NOTE]
> 内部是通过`eval`来执行子应用的js代码的

### 配置详解

#### entry

可以是简单的子应用html链接字符串，也可以是一个对象：
- `scripts`：子应用的js资源
- `styles`：子应用的css资源
- `html`：子应用挂载位置的容器节点，另外可能需要一个大容器来放style等标签，所以这个大容器就是`container`配置项。

> [!NOTE]
> 虽然配置成对象自由度更高，但是实际操作起来难度很大，因为一般js和css资源打包后都是带hash后缀的，频繁的改动会很麻烦，所以提供了**子应用html链接**的方式，不再需要手动处理资源的加载顺序等问题。
> 
> html地址的方式引入子应用，qiankun内部会通过**fetch**的方式请求html文本内容，如果有css或者js资源，也会再次通过fetch来获取内容。

比如该配置：
```js
registerMicroApps([
  {
    name: 'xxx',
    entry: {
      scripts: [
        'xxx-vendors.js', // code split后的依赖
        'xxx-main.js' // code split后的入口文件
      ],
      styles: [
        'xxx-style.css' // css资源
      ],
      html: '<div id="xxx-dom"></div>'
    },
    container: 'xxx-container-dom',
    // 激活规则，可以是简单的字符串，也可以是函数
    activeRule: '/xxx',
    // 透传到子应用的props
    props: {}
  }
])
```
经过`qiankun`的处理后生成的dom结构如下：
```html
<!-- container配置 -->
<div id='xxx-container-dom'>
  <!-- 根据name配置生成的一个div -->
  <div id=`__qiankun_microapp_wrapper_for_${name}` data-name=`${name}` data-version="2.10.16" data-sandbox-cfg="true">
    <!-- 可能会有shadow-root来隔离css， 这里没有写 -->
    <qiankun-header>
      <!-- 微应用自身的内联样式或者微应用 JS 脚本动态生成的内联样式 -->
      <style></style>
      <style></style>
    </qiankun-header>
    <!-- 微应用注册时 entry.styles 的样式会被请求，请求后会在此处被处理成内联样式 -->
    <style></style>
    <!-- 微应用注册时需要提供 entry.html 配置，用于挂载微应用的内容  -->
    <div id='xxx-dom'></div>
    <!-- 微应用注册时需要提供 entry.scripts 配置，配置的脚本被请求后，会通过 (0, eval) 进行动态执行，这里会展示注释表明 JS 资源已经被加载和执行  -->
    <!--   script http://localhost:8080/js/chunk-vendors.js replaced by import-html-entry -->
    <!--   script http://localhost:8080/js/app.js replaced by import-html-entry -->
  </div>
</div>
```

### webpack配置

为什么要给`output.chunkLoadingGlobal='webpackJsonp-xxx'`呢？

首先`chunkLoadingGlobal`这个配置的作用就是在code-split时给**分出来的chunk**添加的一个全局变量，会使用这个变量来进行模块注册。默认值是`webpackJsonp`，所以为了保证多个子应用不互相冲突，添加了`-xxx`后缀来区分。

`self[webpackJsonp-xxx]`是webpack运行时添加的一个`chunk`表，用来维护所有的`chunk`包的，在入口文件中就可以使用这个变量。在`chunk`加载时push到这个变量中，然后执行入口文件代码时就可以从该变量中查找到对应的`chunk`内容。

所以简单点理解这个配置项，作用就是**防止子应用之间相互影响**的，命名也只是一个约定俗成的规则。

### import-html-entry

上面说可以通过`entry`引入子应用的html链接来处理，`qiankun`是通过`import-html-entry`这个库来请求并解析html内容的。

> [!NOTE]
> 和`qiankun`是同一个作者

有两个api：
- `importHTML`：对应`html`形式的`entry`配置，请求并解析`html`
- `importEntry`：对应`config`的`entry`配置，传入js、css资源来请求和解析

大概流程如下：
- 首先通过`fetch`获取到html文本内容
- 然后通过**正则匹配**内联的css、js，外联的css、js
- 对于外联的css通过fetch获取，并转成内联的方式，并且最终会生成注释来说明外联css被处理
- 对于js的script标签也是如此，如果是外联的通过fetch获取，最终通过eval、`new Function`执行。入口js是判断script标签是否有`entry`属性，只能有一个入口，否则会报错；如果都没有`entry`属性，会将最后一个script视为入口。所以**如果没有指定entry属性，不能把非入口js放到最后一个**。
- 对于js通过eval来执行，以此获取到子应用的生命周期，然后转为`single-spa`需要的格式。执行顺序就是在html中`script`的顺序，对于`async`标记的通过`requestIdleCallback`来处理

> [!NOTE]
> - 为什么要改为内联的样式？link标签加载会被浏览器缓存，无法手动清除；而内联样式可以通过js来控制，避免了缓存带来的样式污染
>
> - 为什么要`(0, eval)`来执行函数？因为`(0, eval)`起到了隔离作用域的目的，配合`with(proxy)`可以有效处理js的隔离

**最终目的就是生成一个`template`的html文本**

### code-splitting

上面说子应用需要将所有依赖都打入一个包，这种情况实际是无法忍受的，毕竟所有依赖都在一个包中会导致很多问题：网络加载过慢、网络缓存失效、重复加载等。

所以子应用可以code-splitting，但是需要注意**加载顺序**，比如依赖要在入口js之前被加载。

所以**推荐使用html字符串形式的entry来配置子应用**。

## 原理

### JS沙箱

因为多个子应用可能同时运行，而且一般是在**同一个执行上下文**中的，所以JS可能存在冲突的问题(变量冲突等)，所以需要**沙箱隔离防止子应用之间或主子应用之间的影响**。

> [!NOTE]
> 为什么不使用iframe？虽然iframe天然有着隔离功能(不同的执行上下文)，但是这个隔离功能**开发者无法干预**，一些场景下并不合适(比如子应用需要主应用的一些信息)。

一个极简的实现如下：
```js
// 快照，存储了当前子应用的信息
const fakeWindow = Object.create(null)
// 对快照代理
const proxyWindow = new Proxy(fakeWindow, {
  get(target, key) {
    // 优先从快照中取值
    return key in target ? fakeWindow[key] : window[key];
  },
  set(target, key, value) {
    // 对window的赋值都存到快照中
    target[key] = value;
    return true;
  }
});

// 强制使用快照
with(proxyWindow) {
  // 子应用代码
}
```

> [!NOTE]
> with语法是用来临时添加作用域链的，代码块内部查找变量时会优先在指定对象中查找。

`qiankun`会根据浏览器的能力来选择实现不同的沙箱：
- `ProxySandbox`：支持`proxy`能力并且没有启用`loose配置`的。
- `LegacySandbox`：支持`proxy`能力但是启用了`loose配置`的。
- `SnapshotSandbox`：不支持`proxy`能力的。

> [!NOTE]
> `loose`是qiankun提供的一个配置，通过该配置可以选择`LegacySandbox`这种比较宽松的沙箱模式。不过已经被废弃了，推荐使用ProxySandbox，同时也是默认的沙箱方式。

子应用执行过程中也能动态创建`script`来执行，qiankun的处理方案是对**dom的添加和移除等api做了拦截**，判断是否是动态`script`以便进行拦截处理。

#### 具体实现原理

##### Snapshot Sandbox

激活子应用时对window进行一个**快照记录**，**失活时对比**此时的window和初始的快照，找到变化的并记录，然后将window**恢复**到快照时的状态；
再次激活时将window**恢复到diff**的状态。

不过本质上来说都是直接修改window的，所以同一时间只能有一个子应用运行。

##### Legacy Sandbox

是向后兼容的产物，基于Proxy的，为了兼容之前的Snapshot方案才搞出来的。

激活子应用时对window进行**proxy代理**，proxy中对window的读取和赋值操作**拦截并记录**下来，失活时**根据记录结果进行还原**；
再次激活时从**拦截的记录中将window覆盖**以进行还原处理。

本质上还是对同一个window进行操作的，所以同一时间也只能有一个子应用运行。

##### Proxy Sandbox

**是推荐的，也是默认的方案。**

每个子应用都会对window生成一个**代理对象fakeWindow**，通过**with**强制子应用使用这个代理对象作为执行上下文。后续子应用的处理大部分都是对代理对象fakeWindow的操作，除了少部分白名单的属性或者原生函数。

首次激活时**创建fakeWindow**，将window的属性(可配置的属性)添加到`fakeWindow`上(会有一些特殊处理)，然后在**代理中进行拦截处理**。子应用使用时通过`with(fakeWindow)`使用`fakeWindow`作为执行上下文；
再次激活时，`fakeWindow`没有被清除，所以直接使用即可。

因为每个子应用都有自己的`fakeWindow`，所以同一时间是可以运行多个子应用的。

### CSS隔离\CSS沙箱

CSS也是有作用域的，如全局作用域(默认)、shadow dom作用域，scope作用域(`@scoped`语法)。
- 全局作用域：这是默认的，也是最常见的，css样式对全局dom都会生效
- shadow dom作用域：shadow dom隔离，全局的不影响内部，内部也不影响全局
- scope作用域：通过`@scoped`语法来隔离css，全局的会影响到内部，只是该语法内不会影响全局其他的。

qiankun的隔离方案是基于这三种来的：
- 默认不处理：都会互相影响
- 基于shadow dom的：执行`start`时添加配置`sandbox.strictStyleIsolation = true`启用`shadow dom`，但是这样也会**隔离DOM事件**，对于像antd的modal组件来说就会有问题，因为默认挂到`document.body`上，但是`shadow dom`的隔离内部是获取不到外部dom结构的，所以可能需要额外处理。
- 基于scope的：执行`start`时添加配置`sandbox.experimentalStyleIsolation = true`启用scope隔离方案，给子应用的样式(已经经过`import-html-entry`处理成内联样式)添加了一个**额外的选择器规则**用以限制样式范围。

> [!NOTE]
> `strictStyleIsolation`和`experimentalStyleIsolation`同时设置时，`strictStyleIsolation`优先级更高，因为源码中先判断`strictStyleIsolation`的。

#### 基于shadow dom隔离

原理比较简单，就是创建一个`shadow dom`，然后将子应用的html内容(经过`import-html-entry`处理过的)放到`shadow dom`下即可

#### 基于scope的隔离

- 首先获取到经过`import-html-entry`处理过的内联样式
- 从子应用的容器元素中生成一个唯一选择器前缀
- 遍历处理内联样式，通过正则获取到样式选择器，比如html、body、:root等，进行处理(理论上子应用没有html所以直接去掉，body和:root替换成生成的选择器前缀)；对于其他的选择器，添加上选择器前缀。然后将处理后的样式再赋值回去(借助了一个中间变量swapNode处理)

还有一种比较特殊的情况，就是子应用在**运行时动态添加**的`style`样式：
在子应用mount之前，即经过一系列的处理之后生成一个DOM，将DOM插入到主应用之前。会重写DOM的添加以及移除逻辑，从而实现`style`或者`link`等动态样式的拦截。
