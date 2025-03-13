---
date: 2024-12-23
title: moduleFederation模块联邦
category: engineering
tags:
- frontend
- engineering
- moduleFederation
description: moduleFederation模块联邦的介绍
---

# 模块联邦 Module Federation

## 解决了什么问题

模块联邦是`Webpack5`提出的一个概念，意在解决**模块共享**的问题，即多个项目的公共代码复用问题。

在模块联邦出现之前主要通过这几种方式来实现**模块共享**：

### npm包

这种方式就是将公共代码打包成npm包，需要用到的项目里安装该包进行使用。

但是这会有一些问题：

- 如果**依赖更新**，所有的项目都要手动更新一遍依赖才行
- 其次就是**项目构建**问题，项目中引入了依赖，会造成产物体积变大；是没有办法对源代码treeShaking的，只能引入时按需引入。

### Git Submodule

这种方式是将公共代码放到Git仓库中，然后通过Git子模块的方式复用到不同的项目中。

本质还是复制代码，所以还是有一些问题：

- 公共仓库更新后，依赖的项目需要通过`git submodule`命令来更新子仓库代码

### 依赖外部化+CDN引入

 这种方式是将公共代码抽离成单独的JS文件(一般是UMD格式)**放到CDN上**，然后项目中需要使用的话通过`script`的方式引入。

- 兼容性：不是所有的依赖都能打包成UMD的
- 通过`script`引入会有顺序问题，如果这些依赖包有依赖关系的话，`script`的顺序是有影响的。
- 产物体积：`script`引入的是全量文件，`tree shaking`是没办法起作用的。

### Monorepo

这种方式是把所有的项目代码都放在一起，通过monorepo的方式来管理仓库，多个依赖之间是通过软链的方式关联的。

虽然这种方式很好的解决了应用间模块复用的问题，但还是存在缺陷的：

- 所有的项目代码都要放到同一个仓库中。后期**改动成本**很高
- 项目数量太多的话，依赖的安装时间会变长，项目**整体的构建时间**会变长，会有一些开发时的效率问题。
- 项目构建：因为所有的公共代码都要进入项目的构建流程中，还是会导致**构建产物体积偏大**。

### 小结

可以看到这几种模块共享的方式，都是有一些问题的，要么是**依赖更新**的问题，要么是**构建产物体积**的问题，要么是**构建时间**的问题。模块联邦就是为了解决这些问题而出现的。

## 具体是什么

在`Webpack5`提出了模块联邦的概念，将模块划分为两种：**`本地模块`**以及**`远程模块`**

- `本地模块`：当前构建的一部分，简单点理解就是当前所写的模块。
- `远程模块`：不属于当前构建流程，在**本地模块运行时导入的模块**。

本地模块和远程模块之间还能共享一些模块。并且并不是说一个模块就只能有一种特性，可以既是本地模块又是远程模块。

比如：项目中有个A模块和C模块，同时通过`模块联邦`引入了远程的B模块，在A模块中引入了B模块，C模块中引入了A模块和B模块。那么A模块对于B模块而言就是本地模块，C中引入了A，所以对C而言，A又是远程模块。

模块联邦的优势：

1. 可以**实现任意粒度的模块共享**：第三方依赖、公共组件、工具函数、整个前端应用都可以。可以看作微前端的一种实现。
2. **优化构建产物体积**：远程模块在本地模块运行时被拉取，不参与本地模块的产物构建。
3. **运行时按需加载**：因为粒度可控，所以完全可以做到需要什么拉取什么。
4. **第三方依赖共享**：模块联邦提供了共享依赖的机制，可以很方便的实现依赖的复用共享。

## 如何使用

> [!IMPORTANT]
> 这里以Vite为例

首先最少要有两个项目，一个本地的，一个远程的。

```bash
pnpm create vite
```

并且借助vite社区插件来实现相关功能：

```bash
pnpm i @originjs/vite-plugin-federation -D
```

先在远程模块中进行配置：

```js
// vite.config.ts
import federation from '@originjs/vite-plugin-federation'
export default defineConfig({
	plugins: [
    federation({
      name: 'remote_app', // 配置名称，在本地模块引入时使用
      filename: 'remoteEntry.js', // 配置打包后的文件名称
      exposes: { // 配置打包导出的模块
        './utils': './src/utils.js' // 这就是导出一个utils模块
      },
      shared: ['react'], // 共享依赖
    })
  ]
})
```

然后对远程模块进行打包构建：

```bash
pnpm run build
# 预览，起服务 提供访问能力
npx vite preview --port=8000 
```

本地模块的配置：

```js
// vite.config.ts
import federation from '@originjs/vite-plugin-federation'
export default defineConfig({
  federation({
    remotes: { // 配置远程模块
      remote_app: 'http://localhost:8000/assets/remoteEntry.js' // key是远程模块配置的name，value是远程模块的地址，其中/assets/remoteEntry.js是打包后文件路径
    },
    shared: ['react'] //共享依赖
  })
})
```

这样远程模块和本地模块都配置完了，接下来就可以在本地模块中使用远程模块了：

```ts
// xxx.ts
import { add } from 'remote_app/utils' // 导入远程模块，utils就是远程模块配置的exposes的key

// 就可以使用了
```

> [!NOTE]
> ts会报错 所以需要在.d.ts中声明对应的类型

```ts
declare module 'remote_app/utils' {
	function add(a: number, b: number): number
}
```

总结一下大概的流程：

1. 远程模块通过`exposes`配置项定义导出的模块，然后本地模块通过`remotes`配置项注册远程模块
2. 远程模块构建后部署到云端
3. 本地引入远程模块，即可实现运行时加载。

有一些需要注意的地方：

1. ts报错的问题，上面已经说了解决方案
2. 本地模块打包报错的问题：需要和远程模块的配置保持一致，还有代码混淆需要关掉 否则共享依赖会分析不出来 获取不到。

```js
// host vite.config.ts
{
  // 打包相关配置
  build: {
    target: 'esnext',
    minify: false, // 关闭代码混淆
  }
}
```

## 实现原理

关键原理在这几个地方：

1. 本地模块的引入

```ts
import { app } from 'remote_app/utils'
```

经过vite编译成了以下的内容:

```js{2,13}
const remotesMap = {
	'remote_app':{url:'http://127.0.0.1:8000/assets/remoteEntry.js',format:'esm',from:'vite'}
};

async function __federation_method_ensure(remoteId) {
  const remote = remotesMap[remoteId];
  if(!remote.inited) {
    // 判断 这里只看esm格式
    // loading js with import(...)
    return new Promise((resolve, reject) => {
        const getUrl = typeof remote.url === 'function' ? remote.url : () => Promise.resolve(remote.url);
        getUrl().then(url => {
            import(/* @vite-ignore */ url).then(lib => {
                if (!remote.inited) {
                    const shareScope = wrapShareModule(remote.from);
                    lib.init(shareScope);
                    remote.lib = lib;
                    remote.lib.init(shareScope);
                    remote.inited = true;
                }
                resolve(remote.lib);
            }).catch(reject);
        });
    })
  }else {
    return remote.lib
  }
}

function __federation_method_getRemote(remoteName, componentName) {
	return __federation_method_ensure(remoteName).then((remote) => remote.get(componentName).then(factory => factory()));
}

const __federation_var_remote_apputils = await __federation_method_getRemote("remote_app" , "./utils");
let {add} = __federation_var_remote_apputils;
```

可以看到编译后是通过**动态import**的方式来加载远程模块的，

2. 远程模块的打包

远程模块打包后提供了一个入口文件，即配置的`filename`，本地模块**动态import加载**的是远程模块的入口(上面`remotesMap`中的url地址)，并提供了`componentName`(即上面的`./utils`)，然后获取远程文件(`remoteEntry.js`)，在该文件中通过**动态import加载存在本地的指定文件**。

打包后的文件目录如下：

```bash
- assets
 - __federation_expose_Utils-BgDPpWV1.js # 模块联邦的相关文件
 - remoteEntry.js
```

```js{3,13}
// remoteEntry.js
let moduleMap = {
  "./utils": () => {
    dynamicLoadingCss([], false, './utils');
    return __federation_import('./__federation_expose_Utils-BgDPpWV1.js')
      .then(module => Object.keys(module).every(item => exportSet.has(item)) 
        ? () => module.default 
        : () => module
      )
  }
}
async function __federation_import(name) {
  return import(name);
} 
```

### 共享依赖的实现

本地模块中配置了`共享依赖`的意思就是，当执行远程模块代码时，会优先使用本地的依赖，而不是远程模块的依赖。

如本地模块配置了`shared: ['react']`，那么当执行远程模块代码时 如果用到了`react`，会优先使用本地模块中的`react`，而不是远程模块的。避免了远程模块运行时额外的依赖。

原理是在远程模块中注册了一个`init`函数，在该函数中修改了公共的变量`globalThis`，将共享依赖(本地模块中通过**动态import读取的本地文件**)挂载到了这个变量上`globalThis.__federation_shared__[name]`，然后远程模块如果有用到，就会使用`globalThis`上挂载的，实现了依赖的共享。

