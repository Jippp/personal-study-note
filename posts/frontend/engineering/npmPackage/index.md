---
date: 2025-03-19
title: npm包管理机制以及相关的问题
category: engineering
tags:
- frontend
- engineering
description: npm包管理机制以及相关的问题
---

# npm包管理机制以及相关的问题

从`package.json`说起，然后介绍一下包管理的运行机制，接着看一下`install`的原理。最后总结一下常见的问题。

## package.json

`Nodejs`项目遵循模块化的架构，所以当创建一个`Nodejs`项目时，必须要有一个**描述文件**，就是`package.json`文件。

### 必填属性

虽然`package.json`文件配置项很多，但是必填的就两个：

#### name

**模块名称**，命名有一定的规则或规范：

- url安全：会成为模块url、命令行中的参数或者文件夹名称，所以非url安全的字符在包名中不可用。
- 符号：会将符号去掉，然后去对比是否有重名的包。比如`green_dot`和`green-dot`是一样的。
- 语义化规范

#### version

版本号，遵循`semver`规范，主要分为三个部分：
- 主版本号：大版本更新，可能会有破坏性的改动
- 次版本号：小版本更新
- 修订号：bug修改

### 描述信息

- `description`: 当前项目的描述信息，便于使用者的理解，便于搜索。
- `keywords`: 模块添加关键字，便于搜索。
- `author`: 作者信息
- `contributors`: 贡献者信息
- `homepage`: 项目主页
- `repository`: 项目仓库
- `bugs`: 问题反馈
- `license`: 协议

### 依赖相关

- `dependencies`：生产环境依赖
- `devDependencies`：开发环境依赖
- `peerDependencies`：对等依赖，减少重复依赖的
- `optionalDependencies`：可选依赖
- `bundledDependencies`：打包依赖

> [!NOTE]
> 具体区别看一下这里的[package.json的常见字段](/posts/frontend/engineering/packageJson)

在安装依赖时，会根据**依赖版本范围**来安装对应依赖:

- `~`开头：会匹配最新的**小版本**
- `^`开头：会匹配最新的**次版本以及小版本**，默认。
- `*`：匹配**最新版本**，波动较大，尽量不要用。

### 目录文件相关

- `main`：作为npm包时的入口文件
- `module`：esm规范时的入口文件
- `pkg`：umd入口文件
- `browser`：浏览器环境下的入口文件

> [!NOTE]
> 这几个入口文件的优先级：`module` > `main` > `pkg` > `browser`
>
> 没有module用main，有module再去判断是否有browser

- `files`：包含在发布包中的文件
- `private`：是否私有包，私有包不会被发布
- `publishConfig`：发布配置
- `os`：支持的操作系统

## 包管理工具

### lock文件

目的主要有两个：

1. 在不手动更新依赖的情况下，每次安装依赖时**依赖结构和版本是固定**的。保证协同开发时依赖的一致性。
2. **提高安装速度**：记录了版本和来源，不需要重复解析依赖关系和版本信息。

定期更新依赖：可以通过`outdated`命令来查看哪些依赖可以更新，然后通过`update`命令来更新依赖。
在`update`时会更新符合`semver`规范的依赖，然后再更新`lock`文件。

#### 正确使用lock文件

1. 更新依赖后，一定要提交lock文件。
2. `npm ci` 或者 `yarn i --frozen-lockfile`：会完全按照lock文件来安装，并忽略package的版本范围。
3. `lock`文件有冲突，应删除本地的，重新`install`生成`lock`文件。

## install原理

### npm怎么处理依赖的

`npm3`之前是**嵌套**安装依赖的，最终结构和`package.json`中声明的一样，但是这样会导致**嵌套过深和依赖重复**的问题。

所以后期改为**扁平化**管理：先尽量安装到同一层级，如果版本有冲突，就安装到当前依赖下的`node_modules`中。

但是这样一方面会导致**幽灵依赖**的问题，另一方面`package.json`中的顺序也会对`node_modules`的依赖树有影响。

> [!NOTE]
> 为什么publish时不把lock文件发出去？
> 
> 因为如果固定了依赖版本和结构，就不能和宿主项目中的其他依赖包共享了，会导致冗余。

### 整体流程

1. 首先检查`.npmrc`文件，确定安装源
2. 然后检查是否有`lock`文件
  - 无：
    1. 根据`package.json`文件，从`npm源`获取**包信息**；
    2. 根据`package.json`来构建依赖树；
    3. 遍历依赖树查看缓存：有缓存直接从缓存中解压到`node_modules`中；没有缓存，下载包到缓存中，然后再解压到`node_modules`中。
  - 有：检查`package.json`的依赖和`lock`文件中的依赖是否冲突
    - 有冲突：从`npm源`获取包信息，构建依赖树，检查缓存；
    - 没有冲突：根据`lock`文件中的依赖，检查缓存。

> [!NOTE]
> `package.json`的依赖和`lock`文件中的依赖是否冲突：版本号是否一致，防止有变化的。

### yarn

`yarn`的`lock文件`中**子依赖**的版本不是固定的(还是semver规范，不是一个固定的版本号)，所以使用`yarn`安装依赖可能导致`lock`文件更新。

## 常见问题

### npm的问题

- 低版本的嵌套依赖问题
- 幽灵依赖

### yarn的问题

- 虽然解决了嵌套依赖，但是没有解决幽灵依赖的问题

### pnpm的优化

- **非完全扁平化**管理依赖，解决了大部分幽灵依赖，但是对于旧库的幽灵依赖还是无法修改(改动影响太大 第三方库也不一定有人维护了)

### 幽灵依赖

- 在项目中能直接使用到未在`package`中安装的依赖

#### 出现的原因

npm、yarn采用扁平化管理依赖，即不管在不在`package.json`中，都会平铺到`node_modules`里，就导致了可以引用到未在`package.json`文件中声明的依赖。

#### pnpm怎么解决的幽灵依赖

pnpm在安装依赖时采用`非完全扁平化`：
1. 将所有的依赖都平铺到`.pnpm`目录下
2. 然后在`node_modules`中只平铺**在package.json中声明的**依赖，通过`symbol link`的方式来引用。

这样就解决了幽灵依赖的问题。

#### .modules.yaml文件

由于pnpm采用复杂的符号链接方式，所以需要有一个文件来记录如何处理这些依赖。`.modules.yaml`文件就是这个作用，在pnpm安装或更新依赖时，会读取该文件，判断如何构建`node_modules`.

### 多余依赖

可能存在未被使用的依赖。

- 解决方案：可以通过自定义脚本来判断依赖是否被使用

### 重复依赖

monorepo项目中，既在A有，也在B有。

- 通过自定义脚本来判断依赖被哪些项目使用
- 可以提升到根目录下，子项目中通过`peerDependencies`来引入
