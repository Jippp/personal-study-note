---
private: true
date: 2025-3-17
title: 记录一些常见的面试题 后续再整理
---

# 记录一些常见的面试题 后续再整理

## 基础

### 原型链

js中通过`__proto__`这个隐式属性和一个`prototype`对象实现继承的。

当在一个对象中查找某个属性时，如果自身没有就会沿着`__proto__`原型链往上查找，直到找到或者到原型链的顶端结束：
`obj.__proto__ => Object.prototype => Object.prototype.__proto__ => null`

需要注意以下几点比较特殊的：
1. 对象上有`__proto__`属性，指向构造函数的原型对象；还有一个`constructor`属性，指向构造函数。
2. 函数上有`prototype`属性(箭头函数没有)，指向一个原型对象，该对象是用来给所有实例共享方法和属性的。
3. `Object.__proto__`指向`Function.prototype`，因为Object对象是由Function构造的
4. `Function.__proto__`指向`Function.prototype`，Function算是顶级构造函数，所以Function的原型指向其原型对象
5. `Function.prototype`是一个对象，所以`Function.prototype.__proto__`指向`Object.prototype`
6. `Object.prototype`算是对象的顶级，所以再往上查原型就是null`Object.prototype.__proto__`
7. 可以通过`Object.create(null)`创建一个`__proto__`指向null的对象实例
8. 通过`Object.getPrototype(obj)`访问`__proto__`

### 作用域链

原型链是对象访问属性的，作用域链是访问变量的。

所以作用域就是JS中用于查找变量的一种机制，是由一系列嵌套的作用域对象构造而成的链式结构，每个作用域对象包含了**当前作用域中声明的变量**以及**对外部作用域的引用**，目的是能在执行上下文中通过作用域去访问到变量。

比如读取某个变量时，如果当前作用域内没有声明该变量，就会沿着作用域链去查找，直到全局作用域或者ReferenceError。

js中的作用域是静态作用域，即声明时就已经能确定作用域了。

作用域类型：全局作用域、函数作用域、块级作用域

### 闭包

函数内访问了外部函数作用域中变量，该变量有引用 能访问到，所以不会被GC。

> GC的算法：可访问性算法，从root根节点(很多，通常是作用域 比如块级作用域)开始，能访问到的是活动对象 不会被gc

好处：可以保护内部变量
缺点：内部变量无法随着栈销毁而被销毁，有内存泄露的风险

闭包的函数(return出去的)会在当前执行上下文的作用域引用中添加一个闭包作用域(Closure)，所以查找时能找到闭包的变量。

### EventLoop

是处理异步的机制：
1. 执行同步任务，调用栈依次执行。遇到异步代码，先放到消息队列/微任务队列中保存，等待后续EventLoop处理。
2. 栈退出前，检查微任务队列，然后依次执行微任务队列，直到微任务队列执行全部完成。
3. 微任务队列执行完成后，全局上下文退出，然后判断浏览器是否有渲染更新任务
4. 检查消息队列，取一个消息队列中的任务来执行，然后重复2检查微任务队列。

需要注意微任务的执行时机是全局执行上下文退出之前，这个时间点称为**检查点**。

微任务队列执行完成之后，会判断是否有渲染更新任务，但是这个渲染时机是浏览器决定的，有很多影响因素，所以是不固定的，**是不能认为消息队列之间一定有渲染任务**。

手动触发的`dispatchEvent`、通过`click`回调触发以及手动触发`click`的有什么不同：
- 手动触发的`dispatchEvent`：在当前栈中就派发了事件，并触发了回调。
- 手动触发`click`：直接把click推进调用栈，是一个同步任务，会执行全部的事件回调函数，然后再把click出栈，然后再去判断是否有微任务。
- 通过监听`click`事件触发的回调：是由EventLoop调度的，先从消息队列中取一个来执行，该任务执行完成之后会去检查微任务；微任务执行完成再下一次EventLoop，即消息队列->微任务队列。

```js
const el = document.getElementById("btn")
el.addEventListener("click", () => {
  Promise.resolve().then(() => console.log("microtask 1"));
  console.log("1");
});
el.addEventListener("click", () => {
  Promise.resolve().then(() => console.log("microtask 2"));
  console.log("2");
});
el.click()
```
通过这个demo就知道手动触发`click`和点击dom触发的回调有什么不同。


### Promise

承诺在将来发生变化，并且通过then或者catch回调在发生变化后应该做什么。
是一个异步方案，主要解决回调地狱的问题。

## react

- react组件生命周期
  React组件分为三个阶段：挂载、更新、卸载。函数式组件中没有明确的生命周期函数，可以通过useEffect来模拟：给个空数组依赖就是挂载阶段、数组依赖中添加状态就是更新阶段、返回函数中就是卸载阶段 卸载前执行

- React更新过程/父子组件生命周期的调用
  React的更新是一个dfs+层序遍历：从root开始到叶子节点结束，再遍历兄弟节点、再返回遍历父节点，直到再次回到root。
  在第一次遍历到节点时会执行函数，并且执行hook的逻辑，对于effect来说并没有立即执行，而是pushEffect，将回调放到fiber.updateQueue更新队列上，等到渲染结束后执行。在commit阶段 批量同步执行了effect的清理函数；等到commit之后，再处理effect函数。

  重点在于updateQueue：每个节点都有一个`updateQueue`，其中存了effect回调，并形成环状链表。`commit-mutaition`批量执行destory清理函数，`commit-layout`阶段执行effect的create函数。
  > updateQueue是更新时产生的，存了setState产生的update对象、useEffect等的回调。
  
  这个`执行`是从最后一个节点开始遍历`updateQueue.lastEffect`，即从叶子节点开始往上执行effect的；所以表现到页面上就是**先执行子节点的effect，再执行父节点的effect**。

  `commit`阶段是整棵树被遍历完之后进行的，即root节点被`completeWork`后进入commit阶段。

  另外对于layoutEffect和effect也不太一样，layoutEffect的destory清理函数是在`commit的mutation`阶段执行；effect的destory清理函数是在`commit的layout`阶段执行。所以表现出来就是**layoutEffect的清理函数先执行**。

- 严格模式中，为什么dev模式中useEffect会执行两遍
  为了更好的暴漏问题，防止非纯函数、未清理副作用等造成影响。

- 不可变数据：immer
  可以性能优化，避免不必要的渲染；可以避免直接修改数据带来的难以调试的问题

- React的批处理 batchUpdates
  具体实现：每次setState产生更新任务并不是立即就去渲染，而是将更新任务放到`updateQueue`上，等**代码执行完毕**再批量处理。
  可使用`flushSync`强制立即更新。

- React的性能优化：useMemo useCallback memo Suspense 路由懒加载

- 错误监听：componentDidCatch、getDerivedStateFromError。原生的监听error、unhandledrejection

- React18的新特性：并发模式、批处理、优先级的优化等

- React19的新特性：大部分都是Next用的，基本都是一些服务端渲染的东西

- JSX是什么？语法扩展 会被转成`React.createElement`

- React Fiber架构？为了可中断渲染而引入
  为了解决React16不可中断渲染，长任务阻塞浏览器渲染的性能问题而诞生的。
  重构了任务调度和渲染执行两个模块。通过优先级调度、时间分片、fiber树等处理将不可中断的递归渲染 改成了可中断的循环渲染。
  优先级调度是scheduler中的小顶堆，保证每次进入调度的都是当前优先级最高的渲染任务；
  时间分片是每次调度以及生成vdom之前，都会判断需要分片，及时让出主线程来让浏览器执行渲染；
  fiber树的处理是添加return、sibiling等指针，实现了中断后的继续遍历。

- React diff过程？只比较同层级的(key不同直接替换，key相同再比较type、相同复用 不同替换)
  1. 比较新旧节点，直到不相等
  2. 剩下四种情况：新旧节点都遍历结束(没有变化)、新节点遍历结束(剩下的都是要删除的)、旧节点遍历结束(剩下的都是要新增的)、新旧节点都没有遍历完
  3. 前三种都好处理，主要是最后一种情况。首先记录最后一个可复用节点在旧节点中的位置lastIndex；然后遍历新节点、找到在旧节点中的位置，和lastIndex比较，如果在lastIndex右边，不用处理；如果在lastIndex左右，新节点需要移动位置，然后记得更新lastIndex。直到新节点遍历结束。
  4. 完成了diff过程，最后找到需要处理(打上了标记)的节点即可
  可以通过key来优化，同层级中优化通过key来匹配节点。无key时默认使用索引

- React事件和DOM事件？
  React包装了一层合成事件，为了跨浏览器。通过`onClick`等绑定的就是合成事件，执行时先触发react内部的处理，之后再触发原生事件。

- React并发模式：可中断的渲染，通过对优先级的处理，高优先级可打断低优先级的渲染任务，进而让页面可响应速度更快。

- reconciliation协调过程：一句话总结就是生成vdom、通过diff复用节点

- hooks不能在循环中使用：更新时react会从旧fiber中复用hook来创建新的hook对象，如果循环中使用就不稳定，可能会导致状态混乱。另外react在dev模式下做了判断，将hook放到数组中，如果hook名称对不上就报错。

- react中的函数式编程？

函数式编程：一种编程范式，主张函数是一等公民、数据不可变、强制纯函数等特性。强调使用多个函数以及**组合(柯里化等组合函数)**来处理数据，核心就是将运算过程抽象成函数。

函数式编程的好处：
1. 可复用逻辑；
2. 数据不可变，运行过程和结果可预测也更稳定。

常见的编程范式：
1. PP 面向过程编程
2. OOP 面向对象编程：JAVA
3. FP 函数式编程

而JS和react恰好满足这些条件，所以在React中也主张函数式编程。
1. 通过immer等辅助库实现数据不可变(原理是平衡二叉树复用旧数据)
2. 纯函数：输出完全由输入决定，运行结果可预测并且稳定；并且无副作用(不会对外部环境产生影响，也不依赖外部状态)。
  比如redux的action必须是纯函数、react的render也是纯函数
3. 支持函数的递归调用：函数式编程的要求之一
4. 函数只能有一个参数：函数式编程的要求之一

可以看到JS或者React并不是完全的函数式编程，只是满足了一些函数式编程的要求，所以在讨论React或JS的函数式编程，更多的是指**函数式编程风格**。

### 从React代码到页面渲染的过程

从JSX => render函数`React.createElement` => 经过scheduer调度任务 reconciler协调diff生成fiber 即vdom => commit将vdom转成dom => 浏览器渲染

1. 从JSX到rander函数，是需要babel转译的，具体过程就是转AST => 遍历处理AST => 转成目标代码
2. scheduer调度器根据任务优先级进行调度处理，任务是由reconciler生产的，遍历vdom，过程中会和旧fiber对比找出变化生成新的fiber树
3. fiber构建完成之后进入commit阶段，转成浏览器DOM，该阶段不可中断。
  - beforeMutation：准备工作方便mutation的处理
  - mutaion：DOM操作(创建、更新、删除)，ref清除，effect的destory执行
  - layout：ref赋值，effect的creator执行
4. ReactDOM即renderer将创建好的DOM树添加到root节点下，交给浏览器渲染
5. 浏览器渲染流水线

## Vue

- Vue组件初始化做了什么？
组件生命周期有四个阶段：创建、挂载、更新、卸载

- 如何实现的双向数据绑定？
双向绑定：页面更新时数据也会更新；数据更新时也会导致页面更新。
是基于响应式中的数据劫持和观察者模式来实现的。

getter时添加监听器，setter时触发监听器。
监听器就是观察者模式的实现，观察者模式有两个对象，一个是被观察的，一个是观察的。
体现在这里就是：getter时添加观察者，将数据对应的视图依赖添加进来。setter时找到所有的观察者即依赖，触发依赖的执行。

- 模板编译的过程？

将SFC转成js代码，三个阶段：模板解析、AST优化、代码生成
1. 模板解析：通过内置的解析器将模板template解析成AST
2. AST优化：遍历AST，进行优化(主要是不依赖响应式数据的部分)。
3. 代码生成：最后将AST转成js渲染函数，去生成VDom。

- 响应式？
vue2的Object.definedProperty；vue3的proxy。getter时收集依赖，setter时触发依赖执行，进而达到更新数据的目的。

- 响应式和双向数据绑定的区别？

双向数据绑定多一个观察者，通过观察者可以更新视图；视图更新实际就是在更新数据状态。

在模板编译的过程中，会为数据和组件添加联系，即观察者。更新视图的时候，通过依赖关系找到对应视图，就能更新到视图上。

- v-for加key？

1. 为了优化diff，能加快diff 提高性能
2. key不变，就能保持组件状态

- diff？

双端diff，具体不知道。大概就是从头尾同时遍历吧。

- 组件的更新？

模板编译时，添加了数据和视图的依赖关系；

数据更新时(set)，会执行依赖关系，进而来更新视图；

将模板编译成渲染函数，执行渲染函数生成VDom，将VDom转为真实Dom并插入页面，该过程中会执行生命周期hook。

数据更新，会执行依赖进而更新视图，即重新执行渲染函数。

所以组件更新和模板中绑定的数据有关系，如`computed、props、data`等。

- keep-alive？

内置组件：
1. 缓存池：用Map存储已渲染的组件实例，map的key通常是组件的key或name
2. 激活和挂起：组件未缓存时添加缓存，已缓存时直接复用
3. 组件被缓存时触发`deactivated`、组件复用时触发`activated`

- 生命周期？

1. onBeforeMount
  setup
2. onMounted
3. onBeforeUpdate
4. onUpdated
5. onBeforeUnmount
5. onUnmounted

挂载时是先父组件，再子组件；但是更新时是先子组件再父组件，卸载时也是先子组件再父组件。

- v-if和v-show

v-show始终渲染dom；v-if会判断是否去渲染dom

- v-if和v-for不能同时用？

v-for的解析优先级高于v-if。同时用：
1. 会先遍历出大量dom，再判断是否渲染成真实dom，dom操作频繁，有性能问题。
2. v-for会为每一个循环项创建作用域，v-if依赖作用域的变量可能导致逻辑异常。

- watch和watchEffect区别

1. 依赖：watch要手动指定依赖；watchEffect自动捕获依赖。
2. 执行时机：watch手动指定的依赖变化后立即执行；watchEffect会在组件挂载时执行一遍(捕获依赖关系)，等依赖变化再执行。
3. 场景：watch适用于需要监听特定数据的场景，比如网络请求；watchEffect适用于自动追踪依赖。

- 动态组件？

通过`component`的`:is`动态属性来指定需要渲染的组件，`:is`的属性值包括被注册的组件名、导入的组件对象、html元素。

- 性能优化？

1. 模板和指令优化：v-if和v-show，减少不必要的渲染；v-for时添加key；v-once只渲染一次；v-memo对v-for生成的列表进行渲染优化。
2. 组件优化：keep-alive缓存；合理划分组件；
3. 响应式优化：stopwatchEffect，减少性能损耗；watch时避免深度监听、频繁变化的节流或防抖；watch必要的数据，减少更新；

- nextTick？react的实现？

vue自带的`nextTick`，在下次DOM更新渲染结束后执行回调，保证能拿到最新的DOM以及数据。

原理和rAF类似，就是在下一次页面更新前触发。React中通过添加微任务，在当前宏任务退出前执行回调，即可能到最新的DOM以及数据。

但是可能回调太耗时可能会导致下一次更新延迟，即卡顿。

- vuex和pinia的区别？

pinia基于响应式，使用更方便，类似全局状态，也更轻量、更简单。

## 工程化

- vite为什么快
  1. 基于原生的ESM：开发模式下利用浏览器原生对ES模块的解析能力，自身并不处理打包任务，此外还实现了按需加载。import了什么就发给浏览器什么，让浏览器去处理ES模块内容。
  2. 使用esbuild：进行预加载，将非ES转成ES
  3. 缓存：有预构建的过程，会缓存常用的依赖，避免每次都重新编译。

- vite和webpack的区别
  1. 定位：webpack是打包工具，vite是更上层的构建应用
  2. 速度：webpack是js实现的，通过loader解析非JS文件；vite是esbuild+rollup两个打包器共同作用的
  3. 打包器的不同带来的一些其他差异：比如插件机制的区别、打包产物的区别、构建流程等等
    - 构建流程：webpack是全量构建、从入口开始递归分析依赖 构建依赖关系图、解析文件、打包处理 最后输出；vite是按需加载，import了再去处理，通过插件的transform处理解析文件，最后打包输出。
    - 打包产物的区别：webpack的产物有大量的兼容代码，自己实现了一套polyfill。vite的产物是es版本的，更加简洁。
    - 插件机制的区别：webpack是自己实现的一套机制，基于tapable的，通过调用暴漏出来的hook来影响构建流程；vite的插件机制是基于rollup的，对rollup做了一层兼容处理，实现了vite的插件机制，也是调用暴漏出来的hook来影响构建流程。
  4. 生态：webpack生态更完善；当然vite也在慢慢发展

- 项目迁移到vite有什么问题？
  - 迁移前需要考虑：现有项目中vite不支持的语法、插件、loader、配置等怎么兼容处理？
  - 迁移后需要考虑：影响的范围、怎么进行回归测试，怎么将影响范围缩小？

- webpack插件机制和loader，工作中有没有写过webpack插件？
  - loader是用来处理文件的
  - 插件是通过调用暴漏出来的各种hook来影响最终构建产物的
  - 实际工作中的webpack插件？面试问的话 直接说没做了，反正都是api调用

- tree shaking原理
  - 通过静态代码分析，将未使用的代码移除掉，减少产物体积的一种优化手段
  - 原理：基于ESM的静态分析，import/export就能确定代码是否被使用，构建时标记未import的export。
  - tree shaking是基于import/export的，所以只能做到模块级别的。
  - 对于函数等其他细粒度的tree shaking有一些其他的方案：
    1. 基于AST分析的Terser、SWC、Babel Minify等。可以删除不可达的分支、和未使用的变量等

- package文件的配置：主要是几种dependecies的区别

- package.lock文件作用：
  - 锁，保证版本的一致 并且让依赖安装的更快
  - 通常本地的更新是不需要推送到远程的，除非安装了依赖导致lock文件变化了

- monorepo

## 性能优化

- 性能指标：FCP、CLS、INP。分别衡量了页面的可见速度、稳定性、响应速度。

- 长任务怎么拆分：超过50ms都算长任务，长任务会导致渲染任务无法执行 体现到页面上就是卡顿、丢帧。
    拆分长任务的方法：拆分任务，异步处理，不同步处理就不会阻塞渲染任务
    setTimeout、Promise、requestAnimationFrame、requestIdleCallback、MessageChannel

- 性能优化的方向：时间和空间，时间是指资源加载时间、页面渲染时间。空间是指CPU、内存、本地缓存等

- 首屏优化：页面内容尽快展现给用户、可操作时间提前避免操作无响应

### 预警通的优化

- DNS优化
  - 域名pre-fetch预解析，减少dns查询时间

- CDN优化
  - 公共包上到CND，比如字体文件、jquery这些老的资源、地图数据等

- webpack优化：
  - CompressionPlugin构建时压缩成`.gz`，服务端响应时优先返回`.gz`的压缩包，前端来解压缩，能加快网络响应
  - 图片压缩：ImageMinizerPlugin对svg、png压缩。重要的是选对图片格式，常见几种格式区别：svg、jpg、png、webp、avif
  - 分包(合理缓存)：第三方库基本不变，可以单独成包缓存；引用两次以上的模块会变，但变动不频繁，也可以单独缓存；业务代码变动频繁，不适合单独打包，如果每个业务模块都单独打包，
  - 为什么要分包？合理的分包能减少不必要资源的加载；另一方面也能利用浏览器缓存来复用资源，避免资源重复加载。
  - 目的？包体积更小，
  - 配置：`optimization.splitChunks`。有三个维度决定是否分包：引用频率、chunk体积大小、包请求数
    - `minChunks`引用次数：不是直接import的次数，而是上游是否被打包。
  - 具体措施：
    1. 对于第三方库基本是不变的，需要单独打成包缓存下来；
    2. 被引用两次以上的模块，也有缓存的必要，可以减少资源重复加载
  - 如何优化？策略不是固定不变的，需要经过对包体积的分析来进行迭代更新。

- 路由懒加载和按需引入：构建工具对动态引入的单独打包不会影响首页；懒加载即lazy，react中一般配合suspence
- 非必要的js异步加载：一般是defer，因为async无法保证顺序。

## 项目总结

### 项目中的难点

#### 状态管理方案的优化

项目中一开始是有一套基于context的轻量级的状态管理方案的，但是没有做细粒度的优化，多个组件共用一个context时，修改其中一个状态，其他组件也会被重渲染的。

在后面的一次多人协作的需求开发中就遇到这样的问题：一个context存了大量的状态，修改其中一个状态，导致很多组件都重渲染了，即使没有依赖该状态。
当时因为需求排期问题，为了快速解决问题，直接将context拆分细化了，解决了一部分的问题。
但是还是留了个尾巴，所以在需求上线后复盘时就去社区查找了相关的解决方案，正好那时候zustand也比较火，就借鉴大概的原理实现了这么一套组件级别的状态管理。

具体设计就是借助发布订阅模式，在useSelector中发布状态是否更新的事件，在Provider中进行监听事件。如果状态更新，就只重渲染那一个组件。

为什么不直接用zustand，一方面原来就有一套基于context的方案，该方案只是额外增加了一个api，能平滑的过度使用；另一方面引入一个新的库也有对团队其他人有一定要求，总得花时间去学习。

但是这套方案和之前的context用法上是不兼容的，所以只在后续的新模块中进行了简单的性能对比，具体的优化成果没有数据化，但从 React Devtools 来看组件的重复渲染显著减少，交互也变得更流畅。

#### 城投利差

难点在业务的复杂以及性能优化。

背景：两个树的相互交互以及和后端的交互。

一开始做的难点是如何在旧代码上扩展新功能，以及新功能的业务问题。

旧代码也是赶工赶出来的，注释少，耦合度多，新功能难以复用。所以后面干脆重写了部分逻辑。

新功能的业务问题：两棵树的交互，即增删改查。

后面的难点就性能问题，如何在有限时间内找到有效的性能优化方案。
性能问题主要集中在网络请求上，体现到页面上就是打开速度慢，交互响应慢。
后面和中台、api等沟通后
1. 改为增量渲染方案，进入页面时只返回一级节点的，等需要交互时再获取具体信息。
2. 接口的修改，一开始的技术方案是数据直接存到mysql里面，对于前端来说就是一个持久化缓存，接口没有做任何处理的。后面改为redis存储，接口处理的就更快一点。而且配合增量渲染可以达到一个理想的状态。

## 写题

### 函数式编程-组合compose
极简实现：
```js
function compose(...funcs) {
  return function(...args) {
    return funcs.reduce((a, b) => {
      const result = b(...args)
      return a(result)
    })
  }
}

const add = (x) => x + 1
const mul = (x) => x * 2
const composeFn = compose(mul, add)
composeFn(3) // (3 + 1) * 2 从右到左执行，先执行add，再将结果给mul
```

### curry

实现：
```js

function curry(fn) {
  return function curried(...args) {
    if(args.length >= fn.length) {
      return fn.apply(this, ...args)
    }else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2)) 
      } 
    }
  }
}

const add = (x, y, z) =>x + y + z
const curryFn = curry(add)
curryFn(1)(2)(3) // 6
curryFn(1, 2)(3) // 6
curryFn(1, 2, 3) // 6
```

### 防抖和节流

```js
function debounce(fn, delay) {
  let timer
  return function(...args) {
    if(timer) clearTimeout(timer)

    const context = this
    timer = setTimeout(() => {
      fn.apply(context, ...args)
    }, delay)
  }
}

function throttle(fn, delay) {
  let timer

  return function(...args) {
    if(timer) return

    const context = this
    timer = setTimeout(() => {
      fn.apply(context, ...args)
      timer = null
    }, delay)
  }
}
```

### 两个数组去重

```js
// 核心：利用json转成字符串去对比，需要对对象的顺序做一个排序处理，保持顺序的一致性
function merge(arr1, arr2) {
  const record = new Map()
  
  function stringify(target) {
    if(typeof target !== 'object') return target
    // 排序  
    const result = {}
    Object.keys(target).sort().forEach(key => {
      result[key] = target[key]
    })
    return result
  }

  arr1.forEach(item => {
    const target = JSON.stringify(stringify(item))
    record.set(target, item)
  })
  arr2.forEach(item => {
    const target = JSON.stringify(stringify(item))
    record.set(target, item)
  })

  return Array.from(record.values())
}

console.log(merge([1, { a: 1, b: 2 }], [{ b: 2, a: 1 }])) // [1]
```

### 递归和回溯问题

#### 递归-数组转树

```js
/* 
[
  { id: '1', name: 'a', pid: '' },
  { id: '2', name: 'aa1', pid: '1' },
  // 重复值
  { id: '2', name: 'aa2', pid: '1' },
  { id: '3', name: 'aaa', pid: '2' },
  { id: '3', name: 'b', pid: '' },
  // 环
  // { id: '4', name: 'c', pid: '3' },
  // { id: '3', name: 'd', pid: '4' },
] => 树形结构
*/
function buildTree(list) {
  if(!list || !list.length) return []
  const result = []
  const pidMap = new Map()

  list.forEach(item => {
    if(!pidMap.has(item.pid)) {
      pidMap.set(item.pid, [])
    }
    pidMap.get(item.pid).push(item)
  })

  function dfs(node, circle = new Set()) {
    if(circle.has(node.id)) {
      throw Error(`Circle in node: id-${node.id} name-${node.name}`)
    }
    circle.add(node.id)

    let children = pidMap.get(node.id)
    if(children && children.length) {
      children = children.map(item => dfs(item, circle))
    }
    circle.delete(node.id)
    return { ...node, children }
  }

  list.forEach(item => {
    if(!item.pid) {
      // 一级
      result.push(dfs(item))
    }
  })

  return result
}
```

#### 递归-模块的依赖问题

```js
/*
  [
    { name: 'A', deps: [] },
    { name: 'B', deps: ['A'] },
    { name: 'C', deps: ['A'] },
    { name: 'D', deps: ['B', 'C'] },
  ] => 输出 ['A', 'B', 'C', 'D']
  这么一个数组，依赖处理完成之后输出name

  注意1：可能有环的存在
  注意2：重复的不要加入 比如B依赖A，但是A已经加入到了输出结果中
*/

function getModule(arr) {
  if(!arr.length) return []
  const result = []
  // 遍历deps时需要
  const nameToDepsMap = new Map()
  // 防止重复
  const visited = new Set()
  // 环的检测，处理依赖前加入，依赖处理之后去掉，就能再处理依赖时检查是否有环
  const checkCircle = new Set()

  for(const item of arr) {
    nameToDepsMap.set(item.name, item.deps)
  }

  function dfs(moduleName) {
    if(checkCircle.has(moduleName)) throw Error(`Circle in ${moduleName}!`)
    // 重复不处理
    if(visited.has(moduleName)) return

    checkCircle.add(moduleName)
    visited.add(moduleName)

    // 处理依赖
    const deps = nameToDepsMap(moduleName)
    deps.forEach(depName => {
      dfs(depName)
    })
    // 依赖处理结束 将该模块加入
    result.push(moduleName)
    checkCircle.delete(moduleName)
  }

  for(const item of arr) {
    dfs(item.name)
  }

  return result
}
console.log(getModule([
  { name: 'A', deps: [] },
  { name: 'B', deps: ['A'] },
  { name: 'C', deps: ['A'] },
  { name: 'D', deps: ['B', 'C'] },
]))
```

#### 递归回溯-求笛卡尔积

```js
/*
  [
    ['戴尔', '苹果', '联想'],
    ['笔记本', '平板', 'PC'],
    ['黑色', '灰色', '白色'],
  ] => 输出 [
    '戴尔-笔记本-黑色',
    '戴尔-笔记本-灰色',
    '戴尔-笔记本-白色',
    '戴尔-平板-黑色',
    '戴尔-平板-灰色',
    '戴尔-平板-白色',
    ...
  ]

  是一个回溯暴力穷举的过程：到叶子节点收集路径
*/
function fn(arr) {
  if(!arr.length) return []
  const result = []

  function backTrack(arr, path, startIdx) {
    if(startIdx >= arr.length) {
      result.push(path.join('-'))
      return
    }

    const current = arr[startIdx]
    for(let i = 0; i < current.length; i++) {
      path.push(current[i])
      // 递归
      backTrack(arr, path, startIdx + 1)
      // 回溯，去掉路径 防止重复
      path.pop()
    }

  }
  backTrack(arr, [], 0)

  return result
}
console.log(fn([
  ['戴尔', '苹果', '联想'],
  ['笔记本', '平板', 'PC'],
  ['黑色', '灰色', '白色'],
]))
```

### Promise相关

模拟promise相关的代码，重要的是怎么执行这个promise异步任务：
1. 借助`async\await`来执行
2. 借助`Promise.resolve()`api来执行，该api可以成功或失败，所以执行一个promise任务很合适。

```js
/** 有一个err就执行err，否则返回全部成功的 */
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if(!promises.length) return resolve([])
    const result = []
    let count = promises.length

    for(let i = 0; i < promises.length; i++) {
      const p = promises[i]
      Promise.resolve(p).then(res => {
        result--
        result[i] = res
        if(!count) {
          return resolve(result)
        }
      }).catch(reject)
    }
  })
}

/** 全部执行完，成功或失败都有状态 */
function promiseAllSettled(promises) {
  return new Promise((resolve, reject) => {
    if(!promises.length) return resolve([])
    const result = []

    for(let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then((res) => {
        result[i] = {
          'status': 'fulfilled',
          'value': res
        }
      }, (err) => {
        result[i] = {
          'status': 'rejected',
          'reason': err
        }
      })
      .finally(() => {
        if(result.length === promises.length) {
          return resolve(resolve)
        }
      })
    }

  })
}

/** 和Promise.all相反，一个成功就成功， 否则返回全部失败的 */
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    // 空数组也执行失败
    if(!promises.length) return reject([])

    const result = []

    for(let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i])
        .then(res => {
          return resolve(res)
        })
        .catch(err => {
          result[i] = err
        })
        .finally(() => {
          if(result.length === promises.length) {
            return reject(result)
          }
        })
    }
  })
}

/** 只要一个成功或失败就立即返回 */
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if(!promises.length) return resolve([])

    for(let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i])
        .then(res => {
          return resolve(res)
        })
        .catch(err => {
          return reject(err)
        })
    }
  })
}
```

## 网络

### Get和Post的区别

从规范上来说只有语义上的区别。

因为语义上的不同，产生了一些细微的区别：
- Get是幂等的，Post是非幂等的，即可能对后端产生影响的。
- 语义上的不同，浏览器会做一些不同的默认处理，Get幂等可缓存，Post就不能缓存
- 规范上Get传递时参数跟在URL后面即可，Post传递时参数放到body中。实际都是可以的

### 浏览器缓存

- 强缓存：http1.0的`Expires` http1.1的`cache-control:max-age=3000`
  - 强缓存将资源放在本地，没有过期就直接使用，过期后再去服务器获取。
- 协商缓存：http1.0的`lat-modified/if-modifed-since` http1.1的`etag/if-none-match`
  - 协商缓存每次回去服务器验证资源是否可用，无变化304直接用本地的，有变化返回200以及新内容。

- 按照资源的更细频率以及重要程度来做判断：
  - 比如前端打包后的js、css、图片等资源都是带hash的，那直接强缓存就行了，后续有更新时URL会变化就自动获取新资源了。
  - 但是如前端的html文件，这变化可能会很频繁(spa应该下内容变动很频繁)，就应该用协商缓存

- cache-contorl的取值
  - no-cache：重新验证本地缓存，需要向服务器发送请求来验证
  - no-store：不缓存，向服务器拿新资源
  - max-age：缓存的最大存活时间，单位为s
  - public：中间节点可以缓存资源
  - private：中间节点不能缓存资源。比如用户信息
  - max-stale：客户端愿意接受已过期的资源，但是这个过期有个最大限制，比如max-stale=3，资源过期3s客户端还是愿意使用
  - min-fresh：表示客户端希望获取的是该时间内不会过期的，比如min-fresh=3，客户端希望该资源还有3s以上的时间才过期

### TCP链接(3次握手、4次挥手)

#### 3次握手

SYN+客户端初始序列号 => SYN+服务端初始序列号 ACK+客户端初始序列号+1 => ACK+服务端初始序列号+1

两个目的：
1. 双方都需要确认对方的发送和接受能力正常
2. 双方都需要知道对方的初始序列号，以便后续的数据传输

初始序列号就是数据传输时的起点，后续的数据包会在这个起点的基础上增加，是为了保证数据的一致性以及传输的可靠性的。

> [!NOTE]
> 客户端的初始序列号是1000，服务端的初始序列号是3000。那么后续服务端就会从1001(SYN占一个)开始接收数据，客户端会从3001开始接收数据。如果数据不是从初始序列号开始，可能该数据就是有问题的。

为什么不能两次：如果客户端发送了SYN请求之后，服务端发送ACK响应就认为已经建立了链接，服务端是没有办法确定客户端是否收到了这个信息，如果此时建立了连接，再次收到客户端的请求，会认为是一个新的链接，可能会造成一些混乱。另外3次握手还有一个目的是为了让客户端和服务端交互初始序列号的，如果只有两次可能导致数据传输错误。

#### 4次挥手

客户端发FIN => 服务端响应ACK => 服务端FIN => 客户端ACK

### 常见状态码

101协议升级websocket

200成功 201请求成功并且服务器创建了新资源 202服务器已接收但还未处理 204服务器处理成功但是无响应返回 206服务器成功处理部分内容

301永久重定向 302临时重定向 304资源未修改 307临时重定向

403禁止 404未找到资源 405方法禁用 408超时

500服务器错误 502服务器作为网关从上游接收到无效响应 503服务不可用 504网关超时 505http版本不支持

常用场景如下：
- 100：使用post向服务端传递数据时会先预检，如果服务端接受可能会返回100
- 101：websocket时使用
- 206：大文件上传时可能会用到
- 301：更新了域名可能会用到
- 302：未登录可能临时重定向到登录页
- 304：协商缓存时使用
- 400：参数有误，服务端无法理解或处理
- 401：身份验证不通过可能使用
- 403：禁止访问，是已经提供了身份验证，但是无权限访问
- 500：服务器错误
- 502：bff报错可能使用
- 503：服务器维护时使用

### 网络安全

#### 浏览器的同源策略

协议、域名+端口的限制，目的是防止恶意网站的信息读取。

比如登录了一个非常隐私的网站，这是不小心进入了恶意网站中，如果没有同源策略的限制，恶意网站就能读取到隐私网站的个人信息，进而对用户造成威胁。

通过同源策略的限制，恶意网站无法访问其他源的网站内容或信息。

##### 同源策略的内容

- DOM限制
- Cookie限制
- XHR请求限制
- js脚本限制

### XSS跨站脚本攻击 CSRF跨站请求伪造 CORS跨域资源共享

### CSP内容安全策略

浏览器的安全机制，防止XSS和数据注入攻击的，限制网页可以加载或执行哪些资源(JS CSS iframe 图片等)

通过响应头来设置CSP：`Content-Security-Policy: script-src 'self' https://cdn.example.com`
- `script-src 'self'`禁止加载第三方JS，防止攻击者注入恶意外链来攻击

## 开放性问题

### 组件怎么设计

实际工作中组件大概有两类：业务组件和通用组件，这两个设计原则还不太一样
- 业务组件是和业务强相关的，比如一些模板类的HOC高阶组件，和页面结构强相关。
  - 对于这类组件遵循两个原则：
    1. 单一职责：按功能分离，每个小组件只负责一件事情，避免所有内容都揉在一起。能快速定位问题和调整，并且如果未来有变更也好修改。
    2. 尽量通过props将可变部分抽离：可以在模块内更好的拓展组件功能
- 通用组件和业务就没有太强的依赖关系，比如封装的目录树组件、筛选组件。
  - 当然也是要遵循单一职责元素、props抽离的原则。
  - props语义清晰，避免混乱，最好通过jsdoc写一些注释能帮助使用者了解props
  - 内部状态要可控(受控和非受控)：看组件状态，一般都是需要受控的。
  - 文档要清晰：我一般都会添加readme文档和demo文件，介绍一下组件的功能、注意事项以及如何使用。
  - 对于通用组件，需要经过验证之后才能在其他模块使用。不过我们没有严格的测试场景，一般都是在当前模块内使用没问题，其他模块才会按照当前模块的用法来告知开发使用该组件。

总得来说，组件设计是由需求驱动的，毕竟技术是为了业务服务的。不能过早的抽象，谁也无法预料后续会有什么变更，只能在合适的时机做合适的抽象。

### 怎么看技术债，又怎么处理。

首先技术债不可避免，它是开发过程中的一种阶段性权衡，比如在业务快速迭代时，技术实现不可能是完美的。
真正需要重视的如何及时发现和处理技术债，避免它们在后续的开发中造成更大的问题。

比如我接手过一个舆情订阅的需求，需求里面有一个通用弹窗的内容修改，仅仅是隐藏部分内容，就导致了其他模块中该弹窗的异常，深刻理解到了什么叫技术债。
当时的应对方案是对弹窗内容进行拆分，并且通过props抽离变化部分以及配置文件，确保在不同场景的可适用性。

另外为了防止技术债堆积，也可以采取一些防御性措施：
1. 代码评审：定期的代码评审能有效发现问题
2. 自动化测试：引入自动化测试比如eslint prettier可以在提交代码前，及时发现潜在问题
3. 代码规范：制定代码规范能有效减少不必要的技术债

总得来说，技术债是无法杜绝的，只能通过一些防御措施来降低出现的频率。即使出现，只要及时解决问题，就不会出现技术债堆积从而难以维护的问题。

### 有没有做过技术选型？

技术选型就是为了解决问题的

1. 首先明确问题是什么？
  比如之前的context性能问题，目标就是减少不必要的重渲染，解决性能问题。
2. 针对该问题的解决方案是什么，不同方案的优缺点？
  - 最简单的就是拆分context？一方面会导致代码重复，使用起来也比较麻烦。另一方面并没有完全解决context重复渲染的问题
  - 引入第三方库，如zustand。虽然能解决问题，但是引入新的库会导致团队成员的学习成本。
  - 基于现有方案进行迭代优化。虽然更加复杂一些，但是能解决问题，也能平滑过度。
3. 比较不同的技术方案，选出当前最优的
  找到解决方案，就是比较不同方案的优缺点，看看哪一种更适合当前的场景。比如上面的几种方案，最适合的肯定是基于现有方案设计。
4. 确定方案后，团队验证和落地
  基于这几种方案，做一个demo对比，用事实来找出到底哪一种更合适。

所以总结下来，技术选型最终目的是为了解决问题的，其次是需要经过实际验证才能找到最优方案的，最后还要看看团队的接受程度，是否能快速上手。
