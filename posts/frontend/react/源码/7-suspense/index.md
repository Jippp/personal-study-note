---
date: 2024-09-19
title: react源码7-Suspense
category: react
tags:
- frontend
- react
description: React Suspense原理
---
## Suspense

### 介绍

React16.6之后新增了`<Suspense />`组件，可以作为组件的`等待边界`，当组件是从服务端加载或者懒加载时，会渲染`fallback内容`，避免白屏，等待加载完成之后显示组件内容。

一般都是与`lazy()`配合使用，该方法是用来加载某个组件的，结合一些`Boundler`工具可以进行代码分割等优化操作。

```js
function lazy<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
): LazyExoticComponent<T>;
```

该方法目前(React18)只能和`<Suspense />`组件使用(当然，要是实现一个和`Suspense组件`类似的也能一起使用)。

但是`Suspense`能和其他数据加载的方式一起使用：

```jsx
import { Suspense } from 'react'

let data = ''
function fetchData() {
  if(data) return data
	throw new Promise((resolve) => {
		setTimeout(() => {
			data = 'fetch data'
			resolve('')
		}, 2000)
	})
}

function Content() {
	return <>{fetchData()}</>
}
const SuspenseWrapper = () => {
	return (
		<Suspense fallback={<>Loading...</>}>
			<Content />
		</Suspense>
	)
}
```

页面会先显示`fallback`内容，然后2s后显示`Content`内容。

### 原理解析

从上面的简单demo中可以看出一些`Suspense`的核心原理：子组件抛出一个Promise(`throw new Promise()`)，`Suspense`通过错误捕获，检查类型是一个Promise，随后对这个Promise追加一个`then方法`，在`then方法`中再次更新`Suspense`。然后将`fallback`作为子组件的兄弟节点渲染到页面上，等到Promise状态变化之后，会触发then的执行，再次更新`Suspense`，展示出子组件的内容，并卸载掉`fallback组件`。

具体流程如下：

1. 在React执行`beginWork`进行深度遍历组件生成`Fiber树`时，当遍历到`Suspense组件`，待加载的组件作为其子组件，下一个应该遍历该组件。
2. 当遍历到该待加载的组件时，由于该组件未加载完成会抛出一个异常，该异常为`Promise`，React捕获到该异常会判断类型，如果是`Promise`会对其追加一个`then`方法。在`then`中再次触发`Suspense`的更新。React同时还会将下一个遍历的元素重新设为`Suspense`。
3. 继续`beginWork`流程，再次遍历到`Suspense`时，将`fallback`以及待加载的组件都生成，并直接返回`fallback`，跳过待加载组件的遍历(因为已经遍历过一遍了)。本次渲染结束之后，页面上会展示`fallback`的内容。
4. 当待加载组件加载完成之后，会触发`then回调`，再次更新`Suspense`，直接渲染加载后的组件，并卸载`fallback组件`。

一次`beginWork`流程，遍历的组件顺序如下：

```tex
Suspense -> 待加载组件 -> Suspense -> fallback
```

#### 待加载组件

核心原理就分为两部分：

1. 加载完成，返回组件
2. 否则(正在加载以及加载失败)，抛出异常，异常内容为一个Promise

#### 异常的捕获

React的`reconcil`阶段是在`workLoop`中进行的

```js
do {
	try {
		workLoopSync();
		break;
	} catch (thrownValue) {
		handleError(root, thrownValue);
	}
} while (true);
```

包裹了一层`try..catch`，`throw`的异常会被捕获，进入`handleError`中处理。如果是`Promise`，会做这些事情：

1. 获取到最近的`Suspense`父级组件，没有会报错。
2. 找到之后，给父级组件打上一些标记，意为需要渲染`fallback`(二次遍历`Suspense`)。
3. 将抛出的Promise添加到`Suspense`父组件的`updateQueue`中，后续会对这个`Promise`进行then的追加
4. 遍历完之后会进入`completeWork`的流程，根据`Suspense`打上的标记，将下一次遍历的节点还设置为`Suspense`。这一步主要是为了生成`fallback组件`。

#### 添加Promise的then回调

上面说到会将`Promise`添加到父级`Suspense`的`updateQueue`中，进入到`commit`阶段会遍历`updateQueue`，为每一个都添加回调，回调执行时会触发`Suspense组件`的更新

#### Suspense

说完了上面几个的原理，`Suspense`的原理就是将这几个东西串起来的。

首屏渲染(mount)：

1. `beginWork`遍历到`Suspense`时，会访问子节点(待加载节点)，此时子节点正在加载会抛出异常，捕获之后会将下一次遍历节点还设为`Suspense`

   > react^18.3.1中 是将`Suspense`放到了子组件最后，即会**遍历完所有的子组件**，再回到Suspense。但是也有人说 **貌似是个bug，等到版本更新之后再验证**
2. 第二次遍历到`Suspense`时，将`fallback节点`当做待加载节点的兄弟节点，直接返回`fallback节点`，避免第二次访问子节点。

子节点加载前的更新：

即其他组件触发的`Suspense`更新

1. 第一次遍历到`Suspense`时，如果`fallback组件`有值，就将其添加到`Suspense组件`的待删除队列`deletions`中。其他和上面一样
2. 第二次遍历到`Suspense`时，会清掉待删除队列`deletions`。其他和上面也是一样的

子节点加载后的更新：

加载完成会触发`then回调`，再次更新`Suspense`

1. 第一次遍历到`Suspense`时，都是一样的。但是由于已经加载完成，并没有抛出异常，所以不会第二次遍历`Suspense`，`fallback组件`会被卸载，显示`子组件`

