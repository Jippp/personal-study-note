---
date: 2025-01-13
title: 大智慧预警通项目中舆情订阅需求的复盘
category: workspace
tags:
- workspace
- review
description: 复盘舆情订阅需求，找到问题，复盘和总结
---

# 需求背景

本次需求是在原来的基础上新增了一个分类，但是涉及范围颇广，所以开发时遇到的问题不少。

## 开发遇到的难点

### 如何在旧代码的基础上扩展新增功能，并且还不能影响到旧的

旧代码的扩展维护是很痛苦的，因为谁也不知道后续会有什么样的需求和怎样的改动，只能在开发之初尽量的将逻辑写清晰一些，最关键的还是是**命名和注释**，否则代码都看不懂 天大的本事也难以进行后续的修改。后续如果有扩展功能的话，
  - 最简单直接的办法就是cv修改，当然这会让项目的代码量急剧增加。
  - 还有一种方法，就是将需要修改的东西抽离出去，改成配置的形式增加进页面
  - 最后实在没办法修改扩展的话，就只能重写了

### 组件

#### input输入框组件

该需求中存在回显的功能，所以要受控。

背景是这样的：使用的Input组件，组件内有一个状态，是不区分的，只要触发`onChange`输入，就会更新状态。
外面使用的时候还有一个状态(受控状态)，是输入完成后触发修改状态动作的。
外面的状态作为props传给组件，在组件内通过`useEffect`监听来修改状态，最终显示到页面上。

这样在达到最大字数限制时，就会有一些问题：

因为外部已经处理过了，达到最大字数后会自动截断，之后再输入也是截断后的，也就是说之后**每次传入的prop都是一样的**。通过useEffect是监听不到的，就导致内部的状态不是外面传入的。突破了最大字数的限制。

解决方案：
1. 如果每次修改都能重新渲染Input组件，这样useEffect每次都会触发。能解决问题，但是这样性能就不行。
2. 第二种方案是将内部的setState通过`useImperativeHandle`抛出，外部拿到在极限值时调用更新内部状态。

```tsx
// 组件
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { InputProps } from '@dzh/components';
import { useMemoizedFn } from 'ahooks';
import { Input } from 'antd';
import { isFunction } from 'lodash';
import styled from 'styled-components';

interface NormalInputProps extends Pick<InputProps, 'placeholder' | 'onChange' | 'value' | 'status'> {}

export type onNormalInputChange = Required<Pick<InputProps, 'onChange'>>['onChange'];

export type NormalInputRef =
  | {
      setLimitValue: React.Dispatch<React.SetStateAction<string | number | readonly string[] | undefined>>;
    }
  | undefined;

const NormalInput = forwardRef<NormalInputRef, NormalInputProps>(({ value, status, placeholder, onChange }, ref) => {
  const isOnCompositionRef = useRef(false);
  const [innerValue, setInnerValue] = useState(value);

  useImperativeHandle(ref, () => ({
    setLimitValue: (value) => {
      setInnerValue(value);
    },
  }));

  const handleChange: onNormalInputChange = useMemoizedFn(function (e) {
    setInnerValue(e.target.value);
    // 未使用输入法或使用输入法完毕才能触发
    if (!isOnCompositionRef.current) {
      if (isFunction(onChange)) onChange(e);
    }
  });

  const handleComposition = useMemoizedFn(function (e) {
    if (e.type === 'compositionend') {
      isOnCompositionRef.current = false;
      handleChange(e);
    } else {
      isOnCompositionRef.current = true;
    }
  });

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  return (
    <>
      <InputWithStyle
        status={status}
        value={innerValue}
        placeholder={placeholder}
        onChange={handleChange}
        onCompositionStart={handleComposition}
        onCompositionEnd={handleComposition}
        onCompositionUpdate={handleComposition}
      />
    </>
  );
});

export default memo(NormalInput);

const InputWithStyle = styled(Input)`
  &.ant-input {
    border-radius: 4px;
    /* background: #f8f9fb; */
    border-color: #efefef;
    box-shadow: none !important;
    color: #262626;
    font-size: 12px;
    line-height: 20px;
    padding: 5px 6px;

    &:hover,
    &:focus {
      border-color: #0171f6;
    }
  }
`;

```

使用如下：
```tsx

const MAX_KEYWORDS = 10
const Some = () => {

  const inputRef = useRef()
  const [value, setValue] = useState('')

  const onChange = useMemoizedFn((e) => {
    const val = e.target.value.replace(spaceReg, ' ');
    let valArr = val.split(' ').filter(Boolean);

    if (valArr.length > MAX_KEYWORDS) {
      console.log(`最多添加${MAX_KEYWORDS}个关键词`);
      if (inputRef.current) inputRef.current.setLimitValue(valArr.slice(0, MAX_KEYWORDS).join(' '));
    }
    setValue(
      valArr
        .slice(0, MAX_KEYWORDS)
        .join(' ')
        .concat(val.endsWith(' ') ? ' ' : '')
    )
  })

  return (
    <NormalInput
      placeholder="匹配全部关键词，多个空格隔开"
      value={value}
      onChange={onChange}
      ref={inputRef}
    />
  )
}
```

### 全局响应拦截处理

通过axios提供的响应拦截器，根据接口返回的状态码进行全局的弹窗通知，比如这里的非vip有数量上限。

具体做法就是在响应拦截器中，根据状态码来发布事件。然后在一个全局组件中，订阅该事件，就可以完成全局的弹窗通知。

### 长连接推送，ws sharedWorker。虽然我只是加功能，但是可以研究一下

- sharedWorker：不同tab间共享数据的。
- ws：长连接，但是每打开一个同源的tab页，ws就有一个新的连接，会很占内存。

通过sharedWorker可以让不同tab间共享这一个ws连接。

具体可以看[`这里`](/posts/fontend/solutions/longConnection/)

### redux和rematch的loadingPlugin配合

redux虽然功能完善，但是由于概念较多，以及大量的模板代码一直饱受诟病。

redux的使用，rematch使用简化了什么？和redux-toolkit有什么区别。

首先在redux中，有几个核心概念，state、actions、effect、dispatch。
- state就是存的状态数据
- actions就是修改状态的动作
- effect就是执行副作用的，一般在这里做一些操作如网络请求之类
- dispatch就是派发，通过这个来触发action

其次在使用redux时，还会有很多问题，比如可能需要大量的辅助函数：

```ts
const store = () => createStore(xxxReducer, /* 其他中间件的处理 */)
```

还有就是reducer的声明，存在很多模块代码：
```js
const countReducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return state + action.payload;
    case 'decrement'
      return state - action.payload;
    default
      return state
  }
}
```

rematch的作用是为了减少redux的模板代码，让redux更好用，减少心智负担的。

```js
import { init, dispatch } from '@rematch/core'

const count = {
  state: 0,
  reducers: {

  },
  effects: {

  }
}

const store = init({
  models: { count },
  redux: { /* 配置 */  }
})

```

可以看到使用起来更加的简单了。

#### 在本次需求中遇到的问题

`rematch/loadingPlugin`这个插件的使用，该插件是添加默认值，并且会根据effect来自动修改状态。由于是根据effect来修改状态的，所以effect必须是异步的，不然捕获不到状态。这次遇到的问题就是这样的，没有使用异步effect，导致loading丢失了。

### 左侧列表的自动定位问题

通过`IntersectionObserver`来判断**是否在视口内(entry.intersectionRatio)**，视口内不处理、视口外的通过scrollIntoView滚动到视口内。
  - 通过entry.intersectionRatio <= 0 来区分元素是否在视口内，视口内不处理取消observer监听即可；视口外的话 通过setTimeout的回调scrollIntoView将指定元素滚动到视口中
  - setTimeout的原因：为了延迟执行，因为接口、页面渲染等原因，进入effect的时候如果立即执行这段代码是找不到对应元素的
  - scrollIntoView的配置，旧代码中滚动条是全局的，虽然左侧和右侧区域是分开的，但是滚动条是在全局的，如果配置center就会让页面也动，所以这里配置的是end。根据mdn的解释，center是将元素垂直方向置于可滚动父元素的中间，并且会移动到可视区域的垂直中心(visible area) 可能是这个原因导致了页面也会滚动 进而导致右侧元素排版的错乱。

```ts
useEffect(() => {
  if (isReady && combinationId) {
    const dom = document.getElementById(combinationId);
    observerRef.current = new IntersectionObserver((entry) => {
      if (entry[0].intersectionRatio <= 0) {
        if (dom) {
          callbackRef.current = setTimeout(() => {
            dom.scrollIntoView({ behavior: 'smooth', block: 'end' });
            if (observerRef.current) observerRef.current.disconnect();
          }, 500);
        }
      } else {
        // 在视口内直接取消observer监听
        if (observerRef.current) observerRef.current.disconnect();
      }
    });
    if (dom) observerRef.current.observe(dom);
  }
  return () => {
    if (callbackRef.current) clearTimeout(callbackRef.current);
    if (observerRef.current) observerRef.current.disconnect();
  };
}, [isReady, combinationId]);
```

## 整体开发流程的思考

从数据底层一直到前端页面，经过了数据库、后端、中台、前端四个部分。

别的不说，从前端接到需求开始后，首先是了解需求，然后和产品、UI、中台四方开需求评审会，之后就是评估开发周期，然后进入开发流程，之后就是提测、变更、开发再提测，直到上线的过程。

本次需求的耗时：

1. 一方面是对旧模块的代码不熟悉，不知道需要什么不需要什么，所以中途让中台接口那边加了好几个响应字段来兼容。中台也是一样的问题，也是中途加了好几个接口入参来兼容，或者是调整接口入参的类型。
2. 然后就是对需求的理解和中台、产品都有出入，导致沟通很困难，大家理解都不太一样。和中台理解有出入就导致接口不知道怎么用、响应字段不知道对应哪一块等等问题；和产品理解有出入，就导致页面的交互不明确，一边做一边沟通来理解需求，到底要怎么做，沟通时间其实占了很大比例。
3. 最后就是自己在开发的过程中，忽略了不少细枝末节的东西，导致有不少的逻辑问题。

思考就是，在开发之前就将需求理解个大概，至少和中台、产品的理解要保持在差不多的水平。还有就是中台的接口，最好也是在开发之前给出，这样能避免开发阶段的无效沟通和返工。

