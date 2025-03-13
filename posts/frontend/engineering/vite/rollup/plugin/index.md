---
date: 2025-01-21
title: Rollup插件机制
category: engineering
tags:
- frontend
- engineering
- Vite
- Rollup
description: Rollup插件机制
---

## Rollup的插件机制

更多参考[官方文档](https://cn.rollupjs.org/plugin-development/#plugins-overview)

### Rollup构建过程

会经历两个阶段`build`以及`output`：

- `build阶段`：对应api就是`rollup.rollup()`。会返回一个`bundle对象`，对象中存储了文件的内容以及依赖关系，但是并没有对文件进行打包。
- `output阶段`：对应api就是`bundle.write/generate`。执行该api才会对文件进行打包

Rollup插件在这两个阶段的表现是不同的

### Rollup插件的类型

Rollup构建分成了两个阶段，每个阶段都有插件hook在执行，所以按照这个来分类，可以将插件分为两种：`Build Hook`以及`Output Hook`

另外还能根据Hook的执行方式来划分：`Async\Sync\Parallel\Sequential\First`

- Async、Sync

分别表示异步hook和同步hook，顾名思义，同步hook中是不能有异步逻辑的。

如果是Async钩子应该返回一个Promise。

- Parallel并行

如果有多个插件实现该类型hook，那么会按照插件的顺序来运行。

如果该hook还是Async的话，会并行运行。

- Sequential串行

如果有多个插件实现该类型hook，那么会按照插件的顺序来运行。

如果该hook是Async，会等待该hook执行完成，再运行下一个插件的该hook。

- First

如果有多个插件实现该类型hook，那么这些不同插件中的相同hook会按顺序运行，直到某一个hook返回一个非null非undefined的值

#### 对象类型的hook

rollup插件的hook除了是一个函数，还能用一个对象来表示

```js
function testPlugin() {
  return {
    name: 'test-plugin',
    resolveId: {
      order: 'pre',
      handler(source) {
        // 逻辑
      }
    }
  }
}
```

当是一个对象的时候，必须要有一个`handler函数`来实现具体的逻辑。通过对象来实现hook，可以添加一些可选属性，来更精细的控制hook的执行：

- order：pre | post | null

该属性来控制hook的**执行顺序**。如果有多个插件实现该hook，会按照order的顺序来执行这些插件
  - pre是先运行
  - post是最后运行
  - null是在用户指定的位置运行。
  
多个相同的order，会按照用户指定的顺序来排序

- sequential: boolean

该属性应用于`parallel`hook，比如有abcde五个插件，都实现了相同的`parallel并行hook`，但是c插件中的hook加了个`sequential: true`。那么Rollup就会先并行运行a和b，然后单独运行c，最后并行运行d和e

### 具体的Rollup hook

Rollup提供的hook很多，这里只介绍几个常用的，需要的话去[官方文档](https://cn.rollupjs.org/plugin-development/#buildend)查阅即可

Rollup打包有两个阶段build和output，每个阶段都有很多hook执行。

#### Build阶段大致流程

1. 首先会触发`options`**读取配置**，然后执行`buildStart`钩子，**开始构建**
2. 然后进入`resolveId`钩子开始**解析文件路径**
3. 然后执行`load`钩子**加载文件内容**
4. 接着执行`transform`钩子对**文件内容进行转换**，经过转换之后已经可以拿到转换后的文件内容
5. 随后执行`moduleParsed`钩子进行**AST分析**，判断`import内容`：
    - 如果**动态import**，会执行`resolveDynamicImport`钩子**解析路径**
      - 解析成功，回到`load`
      - 解析不成功，回到`resolveId`钩子。
6. 所有的`import`都解析完成之后，会执行`buildEnd`，**表示`Build阶段`结束**。

在解析路径时(`resolveId`、`resolveDynamicImport`)，路径可能会被标记为`external`，表示不打包，会直接跳过后续的`load、transform`等处理。

还有`watch模式`的两个hook：`watchChange`、`closeWatcher`。
当配置了`rollup --watch`的时候，会先初始化一个`watcher对象`，当**文件内容变化时**，`watcher对象`会**自动触发`watchChange`钩子，并对项目进行重新构建**，当前打包过程结束之后，Rollup会清除`watcher对象`并且调用`closeWatcher`钩子。

可以看到该阶段**主要工作**是解析路径、加载文件、转换文件等工作，并**没有对文件进行打包处理**。

#### Output阶段大致流程

该阶段在API的表现就是调用了`bundle.generate/bundle.write`。

1. 首先会执行所有插件的`outputOptions`钩子，对传入的 **`output`配置进行解析转换**。
2. 然后**并发**执行`renderStart`钩子，进入**打包阶段**。
3. 接着**并发**执行`banner、footer、intro、outro`这四个钩子，作用就是**往产物的固定位置插入(头部和尾部)一些自定义内容**。
4. 随后还会对每一个`import`进行扫描，针对动态import执行`renderDynamicImport`钩子，**自定义动态import的内容**。
5. 解析完内容之后，对每个要生成的`chunk`执行`augmentChunkHash`钩子，用来判断是否需要更改`chunk的hash`。
6. 然后还会判断有没有`import.meta`语句，针对`import.meta.url`会调用`resolveFileUrl`钩子来自定义url的解析逻辑；
7. 对于其他的`import.mete`属性会调用`resolveImportMeta`来自定义解析逻辑。
8. 接着就会生成所有的`chunk`内容，每一个都会依次调用`renderChunk`钩子来**操作产物**。
9. 然后就会调用`generateBundle`钩子，该钩子的入参就已经包含了所有的打包产物信息(`chunk`、`asset`等)，在这个钩子里可以删除一些`chunk`或`asset`。
    - 如果是通过`bundle.write`进入的`output阶段`，那么还是将产物存储到磁盘中，并且触发`writeBundle`钩子。至此打包其实就已经完成了，但是需要手动`bundle.close()`才会触发`closeBundle`钩子，之后打包才真正结束。

该阶段的工作**主要是对产物进行处理**，包括插入一些自定义内容、修改产物的hash、自定义url解析等。

> 当在任何阶段出现错误，都会触发`renderError`钩子，然后执行`closeBundle`钩子结束打包。

