---
date: 2024-12-17
title: 状态管理的介绍
category: state management
tags:
- fontend
- state management
description: 分析状态管理工具
---

# 状态管理工具

## 简介

​	在使用`vue`或`react`时，组件之间可能会需要**共享状态**，即一个组件需要使用另一个组件内的状态或者一个组件需要改变另一个组件的状态

​	为了简化代码，也为了可以控制组件状态，便于维护等诸多需求，状态管理就变得很需要

## 原理

​	把组件之间需要共享的状态抽离出来，遵循特定的约定，统一来管理，让状态的变化可以预测

​	基于该原理或思路，出现了很多的模式和库

## Store模式

​	最简单的一种处理方式就是，把状态存到一个外部变量中，如`this.$root.$data`。但是这种方式不会留下变更的记录，不利于调试

所以需要一个简单的Store模式

```javascript
var store = {
  state: {
    message: 'hello world'
  }
  setMessageAction(newValue) {
    // 可以在这里记录改变日志
    this.state.message = newValue
  },
  clearMessageAction() {
    this.state.message = ''
  }
}
```

+ `state`用来存储数据
+ `action`用来控制state的改变，不直接操作state，而是通过`action`来改变
  + 也正是因为都通过`action`来改变state，所以可以记录下操作日志

+ `store模式`并没有限制组件不能修改store中的state，所以需要**规定**一下，组件不能直接修改属于store实例的state，组件**必须要通过action来改变state**
  + 好处就是可以记录store中发生的state变化，同时实现**记录变更、保存状态快照、历史回滚/时光旅行**等调试

## Flux

​	属于store模式的进化版，更像是一种思想，就和MVC、MVVM之类，给出一些基本概念，所有框架都可以根据其思想来实现

Flux将应用分成四个部分：`View` `Action` `Dispatcher` `Store`

+ `view`是展示层，用来展示数据的。
  + 特点就是会跟随`Store`的变化而改变
  + 一般Store改变，就会向外面发送一个事件如change，通知所有的订阅者Store变化了。view通过`订阅`或是`监听`或一些其他的方式来实现Store变化，view就随之改变
+ `Dispatcher`的作用是：接收**所有**的action，转发给**所有**的store
+ 在视图层即`view`层做出一些操作，就会通过`action`去通知`Dispatcher`，让`Dispatcher`去分发（dispatch）一个`action`。类似一个中转站：接收到view发出的action，然后转发给Store
  + 如新建一个用户，view就会发出一个addUser的action通过Dispatcher来转发，Dispatcher就会把addUser这个action转发给所有的store，store就会触发addUser这个action来更新数据state，数据state改变，view就会随着改变

Flux的最大特点就是单向流动

## Redux

![image-20201129195826441](https://i.ibb.co/TPr9Wm4/image-20201129195826441.png)

### Store

​	Redux里面只有一个Store，整个应用的数据都在这个Store中

​	Store中的state不能直接修改，每次只能返回一个新的state

​	Redux中有一个`createStore`函数来生成Store

```javascript
import { createStore } from 'redux'
const store = createStore(fn)
```

​	Store还支持`store.subscribe`方法来设置监听函数，一旦state发生变化，就会自动执行这个监听函数。只要对view中的更新函数设置subscribe监听，就可以实现state变化，view自动渲染。比如在React中，把组件的render方法或setState方法订阅进去就行

### Action

​	是view发出的通知，告诉store中state要改变。

​	Action中**必须要含有一个type属性**，代表Action的名称。其他属性可以随意，作为参数供state变化时使用

```javascript
const action = {
  type: 'addUser',
  payload: 'user info'
}
```

​	Redux中可以使用Action Creator来批量生成一些Action

### Reducer

​	Redux中没有把Dispatcher独立出来，而是在store中集成了dispatch方法。`sotre.dispatch()`是view发出action的唯一方法

```javascript
import { createStore } from 'redux'
// fn是reducer函数
const store = createStore(fn)

store.dispatch({
  type: 'addUser',
  payload: 'user info'
})
```

​	Reducer是一个**纯函数**，用来处理事件。store收到action后，必须要通过reducer给出一个新的state，这样view才会发生变化

​	由于Reducer是纯函数，对于相同的输入只会有相同的输出，不会影响外部的变量，也不会被外部变量影响，不会改写参数。根据应用的状态和当前的action来返回新的state

`(previousState, action) => newState`

+ `reduce`是函数式编程的概念，相比于`map`映射，`reduce`就是归纳
  + 映射就是把一个列表按照一定规则映射成另一个列表
  + 归纳就是把一个列表通过一定规则进行合并，即对初始值进行操作，返回一个新的列表
+ `Reducer`就是reduce一个列表(action列表)和一个initialValue(初始的state)到一个新的value(newState)

Redux中会有很多的Reducer，大型应用中Reducer函数必然很多，所以需要拆分。Redux提供一个`combineReducers`方法来合成一个根Reducer，该根Reducer负责维护整个State

```javascript
import { combineReducers } from 'redux'
const chatReducer = combineReducers({
  Reducer1,
  Reducer2,
  Reducer3,
})
```

### 大致流程

+ 用户通过view发出Action

  `store.dispatch(action)`

+ 然后store自动调用Reducer，并且转入当前的state和收到的action。reducer会据此返回新的state

  `let newState = xxxReducer(previousState, action)`

+ state变化，store就会调用监听函数

  `store.subscribe(listerner)`

+ listener可以通过store.getState()得到当前的状态

  ```javascript
  function listener() {
    let newState = store.getState()
    component.setState(newState)
  }
  ```

### 对比Flux

+ Flux中store是各自独立的，每个store只对对应的view负责，每次更新只通知对应的view
+ Redux中各子Reducer都是由根Reducer统一管理的，每个子Reducer的变化都要经过根Reducer的整合

+ 通过reducer对state的变动做了限制：只能由reducer来改变
+ 三大原则：单一数据源、state只读、使用纯函数来执行修改

+ **和Flux一样都是单向数据流**

### 中间件

​	项目中，存在同步和异步操作

​	Redux中，同步的表现就是：Action发出后，Reducer立即算出State。异步的表现就是：Action发出后，过一段时间再执行Reducer

​	为了过一段时间再执行Reducer，Redux引入了中间件`Middleware`的概念

​	在刚刚的流程中，只能在view发出action时，加入一些异步操作。即对`dispatch`进行改造

​	Redux提供了一个`applyMiddleware`方法来应用中间件

```javascript
const store = createStore(
	reducer,
  applyMiddleware(thunk, promise, logger)
)
```

+ 该方法主要就是把所有的中间件组成一个数组，依次执行。也就是，任何被发送到store的action都会经过thunk、promise、logger这几个中间件了

### 处理异步

​	对于异步操作而言，一般有两个时刻：发起请求时，和接收到响应的时候。这两个时刻都可能改变应用的state：

+ 请求开始时，dispatch一个请求开始的action，触发state更新为'正在请求'状态，view重新渲染，如展示loadding状态
+ 请求结束后，成功的话，dispatch一个请求成功的action，隐藏掉loading，把新的数据更新到state上。如果失败，dispatch一个请求失败的action，隐藏loading，提示请求失败

Redux处理异步，需要手写一个中间件来处理。一般会选择一些支持异步处理的中间件。如`redux-thunk` `redux-promise`

## Vuex

​	Vuex主要用于Vue中

![image-20201129210908134](https://i.ibb.co/pd0VX0q/image-20201129210908134.png)

### Store

​	其中的state保存中需要共享的数据。只有一个store

​	**单一状态树**的好处就是能够直接地定位任一特定的状态片段，在调试时也可以较为方便的获取整个当前应用状态的快照

​	Vuex通过store选项，把state注入到了整个应用中，这样子组件就能通过this.$store访问到store中的state了

```javascript
const app = new Vue({
  el: "#app",
// 把store对象提供给store选项，就可以把store的实例注入所有子组件中  
  store,
  components: { Counter },
  template: `
		<div class="app">
			<counter></counter>
		</div>
	`
})

const Counter = {
  template: `<div>{{ counter }}</div>`,
  computer： {
  	count() {
      // 通过this.$store来获取到state
      return this.$store.state.count
    }
	}
}
```

### Mutations

​	Mutation是Vuex约定的**唯一改变state的方式**，改变Vuex中的state唯一方法就是提交mutation

**处理同步事务的**

```javascript
const store = new Vuex.Store({
  state: {
    count: 1
  },
  mutations: {
    // payload是通过store.commit传入的数据对象
    increment(state, payload) {
    	// 变更状态   
      state.count ++
    }
  }
})
```

​	触发mutation事件：要通过store.commit方法来触发

```javascript
store.commit('increment', payload)
```

类似于Redux中的Reducer，但在Vue中并不要求每次都要返回一个新的state，可以直接修改state

### Actions

​	Vuex中用来**处理异步**的，相当于Redux中中间件的概念

Action里面执行完异步操作后，都通过store.commit()的方法来触发mutation，一个Action里可以触发多个mutatioin

### 模块化Module

​	Vuex是单一状态树，但是不好管理，所以有**模块化**的概念

***具体的Vuex可以看之前的 [幕布文档](https://share.mubu.com/doc/ILi98hhRgE) 中的内容***

## React-redux

​	Redux是一种思想或规范，和React之间并没有关系。

​	React包含函数式的思想，也是单向数据流，所以一般都用Redux来进行状态管理。在React中一般通过一个`react-redux`的库来和React配合使用

​	Redux将React组件分为`容器型组件`和`展示型组件`

+ `容器型组件`一般通过connect函数生成，它订阅了全局状态的变化，通过mapStateToProps函数，可以对全局状态进行过滤
  + 描述如何运行的，如数据获取、状态更新等
  + 通过监听Redux state，直接使用Redux
  + 通过向Redux派发actions来修改数据state
  + 由connect函数即react-redux来生成
+ `展示型组件`不直接从global state中获取数据，而是来源于父组件
  + 描述如何UI展现的，是应用的骨架和样式
  + 并不直接使用Redux，而是通过props从父组件获取数据
  + 通过props调用回调来修改父组件的数据

react-redux相比于redux，就是多了个connect方法连接容器组件和展示组件，连接就是一种映射：

+ mapStateToProps(state)：把容器组件的state映射到UI组件的props

+ mapDispatchToProps(dispatch)：接收dispatch方法并返回想要注入到展示组件的props中的回调方法

```javascript
// 入口文件index.js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import App from './components/App'

// 创建store
const store = createStore(rootReducer)

render(
  // 通过Provider的store属性将store注入到子组件中，这样就可以在子组件使用store
	<Provider store={store}>
  	<App />
  </Provider>,
	document.getElementById('root')
)
```

```javascript
// 将当前redux store中的state映射到展示组件的props中
const mapStateToProps = state => ({
  
})
// 接收dispatch方法并返回希望注入到展示组件的props中的回调方法
const mapDispatchToProps = dispatch => {
  someFn: props => dispatch(someFn(props))
}
export default connect(
	mapStateToProps,
  mapDispatchToProps
)(展示组件)
```
