---
date: 2024-09-25
title: Next入门篇一
category: Next
tags:
- fontend
- Next
description: Next入门介绍
---

# Next入门篇

[Next官方文档](https://nextjs.org/)
<br />
[Next中文文档](https://www.nextjs.cn/)

## Next是什么？

是基于React的应用层框架，提供了很多内置功能，能快速的构建Web应用程序。
包括的功能有：
- 内置路由
- 静态和服务端渲染
- TS
- 完善的打包配置

## 简单使用

官方提供了一个`create-next-app`脚手架工具来使用，可以快速创建一个Next项目。

### 自动创建项目

> [!IMPORTANT]
> node版本要求：18.17以上

```bash
npx create-next-app@latest
```
其他各种包管理工具都提供了模板：
```bash
yarn create next-app
```
```bash
pnpm create next-app
```

然后按照提示进行选择，就可以创建一个Next项目。
![create-next-app-tip](image.png)

另外还有很多的实例模板，可以在[github仓库](https://github.com/vercel/next.js/tree/canary/examples)中看到。通过这些实例模板，可以学习Next如何在各种环境中使用的。

可以通过`--example`参数直接使用这些模板。
```bash
npx create-next-app --example [example-name] [project-name]
```

### 手动创建项目

通过手动创建一个Next项目，可以更好的学习Next，以及它到底依赖了哪些东西。

1. 创建项目文件夹
```bash
mkdir next-demo
```

2. 进入文件夹安装相关依赖
```bash
pnpm i next@latest react@latest react-dom@latest
```
3. 修改`package.json`
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
},
```

4. 添加文件

`app/page.js`以及`app/layout.js`
> 在新的Next版本中，已经从page路由转成了app路由，所以需要有一个app文件夹

- layout.js：提供布局文件，容器
- page.js：提供页面文件

> 还有一些其他的文件，在后面路由章节会介绍

比如上面的访问`/`路径时，会先进入`layout.js`渲染，然后再渲染`page.js`


### Next CLI常见命令

- `dev`：启动一个本地服务，就可以看到页面了
- `build`：打包服务，不过在`next: 14.2.4`版本发现，该命令和`dev命令`好像有冲突，需要停掉`dev命令`
- `start`：查看打包后的文件
- `lint`：执行lint

## 路由介绍

从一开始`page route`到现在的`app route`。在`next`中路由并没有单独的配置文件，而是通过文件路径来配置路由的，另外也可以通过文件来处理常见的页面状态。

```md
. src
├─ app
│	├─ page.js
│	├─ layout.js
│	├─ demo
│	│	├─ about
│	│	│	├─ page.js
│	│	├─ page.js
│	│	├─ loading.js
│	│	├─ error.js
│	│	├─ layout.js
│	│	├─ template.js
```

首先介绍一些这几个有着特殊名称的文件作用：

- `layout.xx`：布局作用，相当于一个**容器**，会自动将同级的`page.xx`作为`children`传入。顶级的`layout`是必须要有的，而且必须要有`html/body`标签。
- `page.xx`：页面主体，类比`index.xx`的作用，作为**页面的主体内容**。
- `template.xx`：**和`layout.xx`相同的作用**，也会将同级`page.xx`作为`children`传入。但是路由切换时并**不会保留页面状态**，同时**顶级不是必须**的。
- `loading.xx`：提供loading状态，配合`Suspense`实现的
- `error.xx`：提供错误状态，配合`ErrorBoundary`实现的，但是测试时好像开发环境还是会抛出错误。顶级的话是`global-error.xx`，报错会替换掉`layout`，所以顶级的error也需要有`html/body`
- `not-found.xx`：404的页面，有一个默认的。

如果全都有的话，编译之后就是：

```jsx
export default () => {
  return (
    <Layout>
      <Template>
        <ErrorBoundary fallback={<Error />}>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary fallback={<NotFound />}>
              <Page />
            </ErrorBoundary>
          </Suspense>
        </ErrorBoundary>
      </Template>
    </Layout>
  )
}
```

这里**路由的层级就是文件的层级**：访问`/`就是`src/app/page.js`；访问`/demo`就是`src/app/demo/page.js`；访问`/demo/about`就是`src/app/demo/about/page.js`；

## 链接和导航

### 导航

即`SPA`中的跳转到页面其他地方的链接，不会渲染整个页面，只加载需要的部分。`Next`中有4种方式来导航：

1. 提供的`<Link>`组件
2. 客户端中的`useRouter`hook
3. 服务端中的`redirect`函数
4. 浏览器原生的`History API`

#### Link组件

基本用法如下：

```jsx
import Link from 'next/link'

export default () => <Link href='/test'>跳转到test</Link>
```

其中的`href`是支持动态的。

可以通过`usePathname`获取当前的pathname：

```jsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default () => {
  const pathname = usePathname()
  return (
  	<>
    	<h1>当前页面的pathname：{pathname}</h1>
    	<Link href='/test'>跳转到test</Link>
    </>
  )
}
```

另外**路由跳转**有一些滚动条位置问题，默认是**滚动到顶部**的，可以通过配置`scroll`来解决：

```jsx
// 滚动条不会改变，即保持当前页面的滚动位置
<Link href="/dashboard" scroll={false}>
  Dashboard
</Link>
```

#### useRouter hook

客户端组件`use client`中使用

```jsx
'use client'
import { useRoute } from 'next/navigation'
export default () => {
  const route = useRoute()
  
  return <div onClick={() => route.push('/test')}>
  	跳转
  </div>
}
```

#### redirect函数

服务端组件中使用

#### 原生的History API

即`history.pushState/replaceState`

## 动态路由Dynamic Route

因为`next`中采用的是文件名称来进行路由配置的，动态路由需要使用`[xxx]`将文件名称包裹起来，包裹起来的部分会作为`params`参数传递给`layout.xx/page.xx`文件。

> [!IMPORTANT]
> 注意文件名不要是特殊的名称，比如react、route等
>
> 同级下多个动态路由，只会有一个生效，一般是先创建的那个。

### [folderName]

这种写法只能访问下一级

比如文件目录：

```bash
app
- route
	- page.js
	- [id]
		- page.js
```

访问`/route/123`会进入到`[id]/page.js`中，但是访问`/route/123/abc`就会`404`

传入组件(对应的`page.js`文件内容)的`params.id`是字符串

### [...folderName]

访问多级路由

以下文件目录：

```bash
app
- route
	- page.js
	- [...id]
	  - page.js
```

访问`/route/123`会进入到`[...id]/page.js`中

访问`/route/123/abc`也会进入到`[...id]/page.js`中

此时组件中的`params.id`是字符串数组

### [[...folderName]]

会匹配所有的子级路由，**包括自己**。

```bash
app
- route
	- [[...id]]
	  - page.js
```

**和`[...folderName]`的区别在于，访问`/route`时也会进入`[[...id]]/page.js`中。**

> [!IMPORTANT]
> 特别注意这种写法，**不能有默认的page.js**，否则会404

## 路由组Route Groups  `(folderName)`

在`Next`中一般的文件名称都会被映射到URL中，可以通过`路由组`阻止这种行为。

一般用这个**按照逻辑对文件分组**。

使用时只需要用`(folderName)`即可。

比如以下文件：

```bash
- app
	- (group1)
		- layout.js
		- detail
			- page.js # /detail
    - detail1
    	- page.js # /detail1
  - (group2)
  	- layout.js
  	- about
  		- page.js # /about
```

访问`/detail和/about`即可，进行了逻辑上的划分。

路由组只是阻止了将文件名映射到URL，其他的如`layout.xx/error.xx/loading.xx`还是可以用的，比如上面的`/detail`和`/detail1`用的都是`layout.js`。

> 需要注意的时，如果替代的是根布局，那么就需要包括html和body元素。

- 路由分组仅在逻辑上对文件内容划分，没有实际意义。
- 不要有相同的路径，比如`(group1)/about/page.js`和`(group2)/about/page.js`，会报错。
- **跨`layout`的导航会导致页面重新加载**，上述文件中的`/about`跳转到`/detail`会让页面重新加载

## 平行路由Parallel Route  `@folderName`

从名称中可以知道这个是用来干嘛的，即**同一个`layout`中渲染多个页面**的。

如下文件：

```bash
- app
 - route
  - page.js
  - layout.js
  - @some1
    - page.js
  - @some2
  	- page.js
```

会自动将`@some1/page.js`和`@some2/page.js`作为参数传递到`route/layout.js`中:

```jsx
export default ({ children, fontend, backend }) => {
  return (
    <>
      route平行路由测试
      {children}
      {fontend}
      {backend}
    </>
  )
}
```

> 需要注意的是，要有一个page.js，否则会404。page.js相当于是`@children/page.js`。

可以用于条件渲染，比如根据某个条件才显示出`some1`，否则显示`some2`。

这样写也**能单独使用`loading.xx`等**，让**每一个路由都有自己的状态**，这样就更像是子模块而非路由了。

平行路由让复杂页面拆分的更加简单了，将这些**平行路由当做`子模块`来理解**可能会更好。

### default.js

平行路由虽然使用子路由使得复杂页面更加的方便拆分，但是也带来了一些问题。

1. 热更新可能会卡死，需要重启服务
2. 如果平行路由有子路由，直接访问子路由可能会导致404

```bash
- app
 - route
  - page.js
  - layout.js
  - @fontend
  	- show
  		- page.js
    - page.js
  - @backend
  	- page.js
```

上面的文件，直接访问`/route`可以看到页面，如果在`layout`中有个`Link`，跳转到`/route/show`，直接点击跳转`fontend`区域会显示出`show/page.js`的内容。但是如果直接在导航栏输入`/route/show`进行跳转，就会`404`。

这是因为`Next`中导航的跳转(**软导航**)和直接刷新的跳转(**硬导航**)行为是不太一样的，`Link`导航时，执行部分渲染，如果其他的没有匹配上，就不会变化。但直接输入URL进行跳转，就无法确定其他部分和当前URL不匹配的该如何渲染，所以就渲染了`404`。

实际上，直接输入URL跳转，比如`/route/show`，会去查找`app/route/show/page.js`、`app/route/@fontend/show/page.js`、`app/route/@backend/show/page.js`。

为此，`Next`提供了`default.js`，当出现上述的无法匹配问题，就会渲染`default.js`，如果没有`default.js`，就会渲染`404`。

将上述文件目录改为：

```bash{4,11}
- app
 - route
  - page.js
  - default.js
  - layout.js
  - @fontend
  	- show
  		- page.js
    - page.js
  - @backend
    - default.js
  	- page.js
```

在`app/route`和`app/route/@backend`下新增了个`default.js`，这样直接通过URL访问`/route/show`时，就会渲染出对应的`default.js`内容。

## 拦截路由Intercepting Route  `(.)`

即通过`Link`跳转时，可以进行拦截，展示A页面。如果是直接通过URL来访问，则展示B页面。

> [!NOTE]
> 参考交互[https://dribbble.com/](https://dribbble.com/) 
>
> 直接点击图片是一个弹窗，但是此时导航栏的URL发生了变化。如果此时刷新，发现进入了具体的页面。

拦截路由可以让用户即预览了详情内容，又没有打断用户的浏览体验 留在了当前页面。

### 使用

使用拦截路由时，需要文件夹以`(..)`开头：

- `(.)`同级
- `(..)`上一级
- `(..)(..)`上上一级
- `(...)`根目录

> [!IMPORTANT]
> 匹配的是路由的层级 而非文件夹层级，比如那些路由组/平行路由 就不会匹配。

如以下文件：

```bash
- app
  - stop
    - @modal
      - (.)photo
        - page.js
    - photo
      - page.js
    - page.js
    - layout.js
```

在`app/stop/page.js`中通过`Link`跳转到`/stop/photo`，会先进入`app/stop/@modal/(.)photo/page.js`页面，刷新之后才展示`app/stop/photo/page.js`

## 路由总结

上述有好几种路由的方式，这里总结一下：

- 通过`[]`包裹的文件夹名称，作为动态路由
- 通过`()`包裹的文件夹名称，作为路由组，仅作逻辑上的划分
- 通过`@`前缀的文件夹名称，作为平行路由，也不会被映射到URL上
- 通过`(.)`等前缀的文件夹名称，作为拦截路由，是以路由层级而非文件层级。
