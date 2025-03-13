---
date: 2025-01-15
title: Esbuild在Vite中的作用
category: engineering
tags:
- frontend
- engineering
- Vite
- Esbuild
description: Esbuild在Vite中的作用
---

# 背景

Vite是基于ESM的**构建工具链**，其中用到了**Esbuild**和**Rollup**两个打包工具。

## Esbuild是什么

Esbuild是基于Go开发的一款前端打包工具，最大的特点就是整个过程(第三方依赖的预编译、TS的编译、代码压缩等)能共享AST，并且由于语言特性等原因速度很快。

### 为什么这么快

1. Go开发的，**语言优势**。会编译为机器码，执行效率很高
2. **打包算法**使用了多核并行处理，充分利用多核资源
3. **共享AST**，整个过程：依赖的预编译、TS编译、代码压缩等都能共享AST，减少了重复的工作，并且提高了内存使用率。

## 在Vite中的作用

### 依赖预构建

Vite是基于ESM的，但是无法保证所有的第三方库都有ESM版本，所以需要有预构建进行处理，而Esbuild又足够的快，所以Vite选择了Esbuild作为预构建工具。

这里的Esbuild起到一个`Builder`的角色。

### 单文件的编译

将ts转成js，但是只做**转译**工作，没有进行类型检查，只能依赖IDE工具来做类型检查。这个编译是**开发和生产环境**都会有的。

生产环境在打包之前，会执行`tsc`进行类型检查，防止出错。

这里的Esbuild起到一个`Transformer`的角色。

### 代码压缩

Esbuild还有代码压缩的功能，默认作为**生产环境的压缩工具**，原因自然也是因为效率够高。

这里的Esbuild起到一个`Minifier`的角色。

### 总结

可以看到，由于Esbuild优越的性能在Vite的整个工作流程中，都有很重要的作用。

但是Esbuild的缺点也很明显，就导致不得不在生产环境使用`Rollup`来进行打包。

- 只支持打包成ES6之后的代码
- 没有提供操作打包产物的接口
- 不支持自定义分包策略
- 社区支持也不够完善

不过好在Vite再向Rolldown转变了，以后应该一个构建工具就可以，不会再有生产和开发环境不一致的问题。

## Esbuild的插件机制

### 结构

`Esbuild`插件实际是一个对象

```js
const testPlugin = {
    name: 'testPlugin',
    setup(build) {
      // 插件逻辑
    }
}
```

- `name`属性是插件名称

- `setup`属性是一个函数，接受一个参数，该参数是一个对象，提供了一些钩子来让我们进行自定义逻辑的处理。

### 插件钩子

#### onResolve钩子

该钩子主要是**控制路径解析**的

```js
build.onResolve({ filter, namespace }, callback)
```

- `filter`是一个正则，必传项，用来匹配文件路径的
- `namespace`是一个字符串，作为文件的标识，默认是`file`。可以手动的在`callback`中返回一个`namespace`，这样下一个`onLoad`就可以接收到了
- `callback`：回调，不同类型的钩子回调的参数是不同的

  ```js
  ({
      path, // 模块路径
      importer, // 父级模块路径
      namespace, // namespace标识
      resolveDir, // 基准路径
      kind, // 导入方式、import require
      pluginData, // 插件数据
  }) => {
      return {
          path, // 模块路径
          external, // 是否需要外部标识，为true为跳过 
          namespace, // 标识
          pluginData, // 额外绑定的插件数据
          pluginName, // 插件名称
          contents, // 模块具体内容，会作为打包的内容
          loader, // 指定loader js\ts\jsx\tsx\json等
          errors: [],
      }
  }
  ```

#### onLoad钩子

该钩子主要是**控制文件内容加载**的

相关入参和上面的onResolve钩子差不多。

#### 其他钩子

- onStart **构建开始时执行的**
- onEnd **构建结束时执行的**

### demo

下面是一个简单的Esbuild插件demo，作用就是读取`src/index.html`文件，然后返回一个`abc`字符串。
根据Esbuild配置，会将文件输出到`dist/index.js`中：
```js
(() => {
  // html:./src/index.html
  abc;
})();
```

plugin demo代码：
```js
const htmlTypesRe = /(\.html)$/;

const testPlugin = {
  name: 'testPlugin',
  setup(build) {
    build.onResolve({ filter: htmlTypesRe }, ({ path, importer }) => {
      // console.log(path, importer)
      // path: ./src/index.html
      return {
        path,
        namespace: 'html'
      };
    });

    build.onLoad({ filter: htmlTypesRe, namespace: 'html' }, () => {
      return {
        contents: 'abc'
      };
    });
  }
};

require('esbuild')
  .build({
    absWorkingDir: process.cwd(),
    entryPoints: ['./src/index.html'],
    outdir: './dist',
    bundle: true,
    write: true,
    plugins: [testPlugin]
  })
  .catch(() => process.exit(1));

```
