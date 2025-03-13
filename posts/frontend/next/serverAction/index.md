---
date: 2024-10-22
title: Next中ServerAction的使用
category: Next
tags:
- frontend
- Next
description: 详细介绍一下ServerAction
---

# Next中ServerAction的使用

## 介绍和基本用法

在Next中，`ServerAction`是一种用来在**服务端**处理异步逻辑的函数，一般体现为异步函数。

可以通过使用`ServerAction`减少网络通信的次数，提高页面的加载速度。

### 基本用法

`ServerAction`分为两种，一种是模块级的，一种是函数级的。

- 模块级：新建一个单独的文件，文件开头使用`'use server'`来指定该模块内所有导出的函数都是`ServerAction`
- 函数级：如果在组件内单独使用，需要在异步函数内部使用`'use server'`来声明。

虽说`ServerAction`在服务端组件、客户端组件都能使用，但是在客户端组件中只能使用`模块级ServerAction`。

#### demo code

模块级`ServerAction`如下：
```ts
// src/app/actions.ts
'use server'

export async function someAction() {
  // 异步逻辑
}
```
一般模块级的都是`xxxAction`为名的，使用时从该文件中导入即可。

函数级`ServerAction`如下：
```tsx
export default function SomeComponent() {
  async function someAction() {
    'use server'
    // 异步逻辑
  }
}
```
在函数体内部通过`'use server'`来声明该函数是一个`ServerAction`。

### 使用场景

在`PageRouter`下，如果前后端想要交互，需要先定义一个api接口，然后前端调用该接口获取数据，完成交互。
但是在`AppRouter`下，不需要定义api接口，直接在前端调用`ServerAction`即可。

> [!NOTE]
> ServerAction是在服务端执行的，虽然是为了取代api接口而出现的，但是在服务端执行的特性，可以让他做很多其他的工作。


## 原理

### 原理

```ts
// src/app/action.ts
'use server'

export async function addAction() {
  return 111
}
```

```tsx{7}
// src/app/page.tsx
import { addAction } from './action'

export default function Page() {
  return (
    <>
      <form action={addAction}>
        <button className='block w-80 h-20'>addAction</button>
      </form>
    </>
  )
}
```

点击button，可以看到会向当前页面发送一个**post请求**，携带**当前元素的数据状态**和一个`$ACTION_ID`，这个`$ACTION_ID`是一个随机数，用来区分不同的`ServerAction`。等待执行完成之后，会返回一个`RSC Payload`的数据，这个数据包含新的UI和数据，用来渲染更新之后的页面。

在浏览器的network中可以看到请求携带的数据如下：
```
1_$ACTION_ID_4cafd38fa47f901c5a6ccd4b5073432ae0e0de59: 
0: ["$K1"]
```
第一个就是`$ACTION_ID`，第二个是当前元素的状态数据，一般是传递给serverAction函数的参数。
比如:
```ts
addAction('info')
```
那么就会变成`0: "info"`。

> [!NOTE]
> 上面的`0: ["$K1"]`是Next处理的，自动传递给ServerAction的formData数据。

返回的rsc payload数据如下：
```
0:{"a":"$@1","f":"","b":"development"}
1:111
```

> [!IMPORTANT]
> 如果不是配合form使用的话，是不会携带$ACTIOIN_ID的，但是会有一个请求头next-action相当于这个actionid。

简单来说：
1. 会通过发送一个`POST`请求，携带当前所在元素的状态数据，根据`$ACTION_ID `来区分不同的action
2. 该请求返回一个`RSC Payload`的数据，包括了新的ui和数据，用来渲染更新之后的页面。

### 优点

1. 可以替代api接口，让前端直接调用`ServerAction`，并且是函数级别的，可以在任意地方服用
2. 配合form元素使用时，默认会自动添加formData作为参数，支持渐进式增强。即使禁用了JS，表单还可以正常提交。

## 注意事项

因为本质是通过POST请求来传递参数和返回值的，所以传递的参数和返回值都必须可序列化，否则会报错。

### 配合Form表单使用

在配合form表单时，通常会使用到react18新增的两个hook，`useActionState`和`useFormStatus`。

> [!WARNING]
> 需要注意的是，这两个hook在当前时间(2024.10 reactv18.3.1)还是处于实验阶段的。实际使用时需要去官网看看最新的使用方法。

#### useFormStatus

> [useFormStatus官网介绍](https://zh-hans.react.dev/reference/react-dom/hooks/useFormStatus#noun-labs-1201738-(2))

返回表单提交的状态信息。

```js
const { pending, data, method, aciton } = useFormStatus()
```

```tsx
'use client'
import { useFormStatus } from 'react-dom'

export default () => {
  const { pending } = useFormStatus()
  return (
    <button type='submit' aria-disabled={pending}>add</button> 
  )
}
```

```tsx
import Button from './button'

export default () => {
  return (
    <form>
      <input type="text" name="info" />
      <Button />
    </form>   
  )
}
```

使用时注意，`useFormStatus`必须要在`form`元素内部使用，否则会报错。
而且仅会返回父级form元素的状态信息，当前元素以及子集的form元素的状态信息不会返回。

#### useActionState

> [useActionState官网介绍](https://zh-hans.react.dev/reference/react/useActionState#noun-labs-1201738-(2))

可以根据某个表单action动作的结果来更新`state`的状态。

```js
const [state, formAction, isPending] = useActionState(actionFn, initialState, permalink?)
```

```jsx
import { useActionState } from "react-dom";

async function increment(previousState, formData) {
  return previousState + 1;
}

function StatefulForm({}) {
  const [state, formAction] = useActionState(increment, 0);
  return (
    <form>
      {state}
      <button formAction={formAction}>Increment</button>
    </form>
  )
}
```

### 重新验证数据

在`serverAction`中，如果修改了数据，一定要重新验证数据，否则数据不会及时更新。

- 使用`revalidatePath`
- 使用`revalidateTag`

### 错误处理

由于`serverAction`是一个函数，执行时难免会报错，如果有报错：
- 可以通过返回某个和前端约定的值来通知，这样页面就能自己处理错误
- 还可以直接`throw`错误，这样会被页面最近的`error.tsx`页面捕获
