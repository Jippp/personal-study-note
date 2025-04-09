---
private: true
date: 2025-3-17
title: 记录一些常见的面试题 后续再整理
---

# 记录一些常见的面试题 后续再整理

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

项目中一开始是有一套基于context的轻量级的状态管理方案的，但是没有做处理，context还是会导致一些非必要的组件渲染，会有一些性能问题的。

后来随着zustand越来越火，然后就借鉴了zustand的原理实现了一套组件级别的渲染。
在Provider中监听数据变化，变化之后触发回调。回调是组件内发布的，在回调中判断前后状态是否一致，一致的话强制刷新组件。这样就减少了非必要更新。

为什么不直接用zustand，一方面原来就有一套基于context，能平滑的过度使用；另一方面引入一个新的库也有对其他人有一定要求，总得花时间去学习。

这个优化成果倒是没有详细比较过，不过从理论上说，越复杂的模块能减少的非必要渲染就越多，自然就能提高页面的渲染性能。

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

