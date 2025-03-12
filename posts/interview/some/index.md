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
  - tree shaking是基于import/export的，其他？TODO

- package文件的配置：主要是几种dependecies的区别

- package.lock文件作用：
  - 锁，保证版本的一致 并且让依赖安装的更快
  - 通常本地的更新是不需要推送到远程的，除非安装了依赖导致lock文件变化了

- monorepo

## 性能优化

- 性能指标：FCP、CLS、INP。分别衡量了页面的可见速度、稳定性、响应速度。
    

## 写题
