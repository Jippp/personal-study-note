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

- 高内聚、低耦合

3. 组件怎么测试

- `npm link`到本地项目中测试

4. 组件库代码怎么管理的

- `monorepo`：因为不仅有基础组件，还有业务组件、公共库、工具函数等
  - `pnpm workspace`即可，因为不是很大
  - 其他方案：lerna等

5. 组件库打包用`Rollup`和`Webpack`有什么区别

- `Rollup`体积更小，打包出来的产物没有runtime逻辑代码。webpack的产物有很多的runtime代码，为了能通过依赖图解析文件，产物中添加了一些处理逻辑的代码，所以体积略大一些
- Rollup更快，rust比js快

6. 组件库从发布到使用

- `npm publish`发布，当然发布前肯定要做一些检查工作，所以可以加到脚本内，最后执行脚本一键发布。项目中npm镜像要切到本地，然后安装依赖
  - `.npmrc`可以添加镜像源
  - `package.json`中要修改：module、unpkg、types、files、peerDependencies
  
7. 其他

package.json中
- 通过`module引入esm的入口`，通过`unpkg引入umd的入口`，通过`types/typings引入ts文件`
- `files`上传到npm仓库的文件\文件夹
