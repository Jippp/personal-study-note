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

# 详细内容



