---
private: true
date: 2025-03-18
title: 组件库的一些内容
---

1. 为什么要有组件库

一方面原来的组件库放在项目代码的`components`文件夹下，代码量越来越多，体积太大

另一方面公司搞了个低代码平台

所以这两个原因催生了组件库。不过这里主要是业务组件库，一些定制化的表格、筛选、布局、目录树、弹窗等组件。

2. 怎么写的组件

核心设计原则：
- 单一职责原则：组件功能要明确，每个组件只负责特定功能，不要耦合
- 高内聚、低耦合：对外无依赖或者依赖少
- 可复用性
- 可配置性：props、children传参实现组合。
- 隔离性：注意样式隔离

3. 组件怎么测试

- `npm link`到本地项目中测试

4. 组件库代码怎么管理的

- `monorepo`：因为不仅有基础组件，还有业务组件、公共库、工具函数等
  - `pnpm workspace`即可，因为不是很大
  - 其他方案：lerna等

大智慧组件库的管理：pnpm workspace：
- `pnpm -F <package> add <depsName> --workspace`：在指定package中安装依赖
- `pnpm add <depsName> --workspace|-w`：在所有package中安装通用依赖
- 提供了在根目录执行子项目的命令：
```bash
pnpm -F <package> exec <command> <args>
pnpm -F <package> exec npx tsc --init
pnpm -F <package> exec pnpm run build

# 递归执行命令
pnpm -r run build
```

5. 组件库打包用`Rollup`和`Webpack`有什么区别

- `Rollup`体积更小，打包出来的产物没有runtime逻辑代码。webpack的产物有很多的runtime代码，为了能通过依赖图解析文件，产物中添加了一些处理逻辑的代码，所以体积略大一些
- Rollup更快，rust比js快

大智慧组件库的打包：
- gulp组织流程，esm以及umd两个格式的产物。
- es产物：less文件用less来解析、module.less用postcss来解析；js文件用babel来解析；ts文件用gulp-typescript来解析
- umd产物：webpack来处理，ts文件用ts-loader；less文件用less-loader、css-loader；其他文件用webpack的resource；

6. 组件库从发布到使用

- `npm publish`发布，当然发布前肯定要做一些检查工作，所以可以加到脚本内，最后执行脚本一键发布。项目中npm镜像要切到本地，然后安装依赖
  - `.npmrc`可以添加镜像源
  - `package.json`中要修改：module、unpkg、types、files、peerDependencies
  
7. 其他

package.json中
- 通过`module引入esm的入口`，通过`unpkg引入umd的入口`，通过`types/typings引入ts文件`
- `files`上传到npm仓库的文件\文件夹
