---
private: true
date: 2025-3-17
title: 学习vue3时记录的基础知识
---

# 基础知识

1. 属性Attr绑定：`:class='xxClass'` 或者 `v-bind:class='xxClass'`
2. 事件绑定：`@click='add'` 或者 `v-on:click='add'`
3. 表单绑定：双向绑定，`v-model` 是`:value以及@change`的语法糖
4. 条件渲染：`v-if/v-else/v-else-if`
5. 列表渲染：`v-for='(item, idx) in list'`
6. 计算属性：computed，和react中的useMemo一样，会缓存值。不过这里不用手动添加依赖，vue会通过`get`捕获到依赖，`set`时会自动更新
7. 生命周期和dom引用：和react一样，`ref`引用是在挂载阶段被赋值的，所以vue中只能在`onMounted`之后访问到挂载的ref
8. 监听器：watch，和react中的useEffect一样，依赖变化自动执行逻辑。`watch(deps, creator)`
9. 组件props：通过`defineProps()`定义组件可以接收的props，之后props内容可以直接在组件的`template`中使用。父组件可以直接传递，也可以通过`v-bind、:`传递动态参数
10. emits: 子组件通过`definedEmits`向外抛出事件，父组件可通过`v-on、@`来监听抛出的事件，达到父组件中使用子组件状态。
子组件代码：
```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits(['response'])

emit('response', 'hello from child');
</script>

<template>
  <h2>Child component</h2>
</template>
```
父组件代码：
```vue
<script setup>
import { ref } from 'vue'
import ChildComp from './ChildComp.vue'

const childMsg = ref('No child msg yet');
</script>

<template>
  <ChildComp @response="" />
  <p>{{ childMsg }}</p>
</template>
```

11. 插槽slots：子组件中通过插槽预留空间，父组件填充插槽。
```vue
<!-- 子组件 -->
<template>
  <slot>fallback content</slot>
</template>
```
父组件：
```vue
<script setup>
import ChildComp from './ChildComp.vue'
</script>

<template>
  <ChildComp>123</ChildComp>
</template>
```
子组件通过`slot`元素作为插槽出口，并且可以添加备用内容，上文中的`fallback content`。
父组件直接通过`children`渲染插槽内容。

## 详细内容

### 组合式API

- `ref()`

因为响应式是监听的对象，所以最终需要通过`xxx.value`来访问或修改实际的值。另外在`template`自动解包，不需要添加`xxx.value`。

当然也可以在`ref`中监听一个引用值，让其变成响应式。通过`xxx.value.xxprop`来访问具体的属性。

有一个`shallowRef()`浅层响应式。

- `reactive()`

`ref`是让一个简单类型的值拥有响应式，`reactive()`让引用类型自身拥有响应式。

`ref`中可以放引用值，但是`reactive`中不能放原始类型的值。

另外解构时，也会导致响应式丢失：
```js
const state = reactive({ count: 0 })

const { count } = state
count++ // 不会影响state，响应式丢失了

state.count++ // 只能这么写
```

**所以官网推荐`ref`而不是`reactive`。**

也有一个`shallowReactive()`浅层响应式，目的是防止大数据嵌套太深带来的性能问题。

- 自动解包

1. 只有顶层ref可以自动解包，嵌套的还是需要`xx.value`
```js
const state = { count: ref(1) }

// 模板中 {{ state.count }}是不行滴，要解构出来
const { count } = state
// 这样在模板中才能解包{{ count }}
```

- `setup`

setup函数太繁琐，需要手动抛出方法和变量。所以有了`<script setup>`，其中顶层的导入、声明的变量和函数可以在同一文件的`template`中使用。

props解构会失去响应性
- 通过`props.xxx`的方式来使用
- 通过`toRefs、toRef`来包裹转成响应式对象

### 监听器

- watch

通过手动添加数据源，来达到监听的目的。

- watchEffect

会立即调用，其次在内部捕获依赖，不需要手动添加数据源。

但是需要注意，内部捕获依赖是同步的，如果有异步操作，需要等到异步操作结束之后才能捕获到依赖。

- 副作用的清理

比如watch/watchEffect中发请求，如果依赖变动频繁，请求就会发很多次。这就需要清理函数。
提供了一个`onCleanup`函数，**3.5**之后有一个`onWatchCleanup`api：

```js
watch(deps, (newDep, oldDep, onCleanup) => {
  // 逻辑
  onCleanup(() => {
    // 清理逻辑
  })
})
watchEffect((onCleanup) => {
  onCleanup(() => {
    // 清理逻辑
  })
})
```

**3.5**的`onWatchCleanup`Api用法：
```js
import { watch, onWatchCleanup } from 'vue'

watch(deps, () => {
  // ...逻辑

  onWatchCleanup(() => {
    // 清理逻辑
  })
})
```
`onWatchCleanup`这个api有一些局限：如只能在`watch\watchEffect`同步执行时调用，即不能放到`await`等异步操作后。

- 更新时机：父组件DOM更新后，当前组件DOM更新前，执行监听回调。

因为是在DOM更新前执行的，所以在监听器回调中无法访问更新后的DOM：
1. 通过第三个参数配置:`{ flush: 'post' }`
2. `watchPostEffect`api

还有一个同步监听器：`watchSyncEffect、{flush: 'sync'}`，会在Vue进行任何更新前触发，不过同步监听器**不会批处理**。

- 停止监听：默认情况下直到组件卸载才会停止，因为大部分是不需要停止的。

如果需要手动停止监听：
```js
const unwatch = watch(deps, () => {})

// 停止监听
unwatch()
```

### 模板引用

在react中，直接useRef挂到元素的ref上就能获取到元素了。但是在vue中，需要两步：

1. 在template中挂载一个ref
2. 在script中通过useTemplateRef来拿到具体的引用
```vue
<script>
import { onMounted, useTemplateRef } from 'vue'

const input = useTemplateRef('my-input')

onMounted(() => {
  if(input.value) input.value.focus()
});
</script>

<template>
  <input ref='my-input' />
</template>
```
`useTemplateRef`是**3.5**之后的版本，之前需要在template中的ref挂载到一个ref响应式变量中。

只能等组件**挂载之后**才会赋值，所以需要考虑null的情况。

- v-for中的ref

v-for中挂载ref，ref的值是所有循环出来的ref引用。

```vue
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'

const list = ref([
  /* ... */
])

const itemRefs = useTemplateRef('items')

onMounted(() => console.log(itemRefs.value));
</script>

<template>
  <ul>
    <li v-for="item in list" ref="items">
      {{ item }}
    </li>
  </ul>
</template>
```

- 组件上的ref

直接在组件上通过`ref`即可，但是需要主要`<script setup></script>`这种方式会导致组件**私有化**，无法被父组件访问的。

需要通过`definedExpose()`来抛出，该方法需要在任何异步操作之前调用。

### vite项目配置

别名的配置：

首先在`vite.config.ts`中添加`resolve.alias`配置，需要注意，该文件是在node环境下运行的，并且alias需要一个绝对路径。所以需要这么写：
```js
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src')
    }
  }
})
```

> [!NOTE]
> 如果是ts需要安装`@types/node`

另外如果是ts项目，还需要在`tsconfit.app.json`中添加配置，以免ts报错：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "path": {
      "@/*": "./src/*"
    }
  }
}
```

> [!NOTE]
> vscode中检查一下`vue.server.hybridMode`这个配置项 可能有影响 也可能是我的电脑反应慢。
