---
date: 2024-12-19
title: monorepo workspace changeset
category: engineering
tags:
- fontend
- engineering
- monorepo
description: monorepo项目中使用workspace、changeset
---

## 背景

一个新技术的出现必然是为了解决之前的一些痛点和难点的。

当一个Git仓库随着项目的不断迭代发展，这个仓库的体积也会不断的变大变复杂，就会导致一系列的问题，比如构建速度变慢、依赖管理混乱等，如果不加以干预，最终就会变成一个难以维护的巨石应用。

出现巨石应用后，会将项目拆分出来，放到多个子仓库中管理，这种代码管理方式称为`Multirepo`。但是业务代码越来越多，子仓库也会越来越多，这就会导致多个仓库之间的依赖管理变得非常复杂，而且隔离出去之后代码风格也很难控制、代码的复用也成了一个问题。

所以就有了`Monorepo`，在同一个仓库中管理多个项目，这样就可以解决多仓库带来的问题。另外可以通过`workspace`以及`changeset`来解决单个仓库依赖管理的问题。

可以看到`Monorepo`实际是在单仓库管理方式的一种改进，所以优点和缺点都很明显：

优点：
- 单个仓库中，代码风格统一，代码复用性高。
- 所有项目的依赖都在顶层，磁盘占用较少(使用pnpm 都在全局)。
- 通过软链接可以方便的本地调试

缺点：
- 单个仓库下，代码权限可能有些问题，因为每个人都能修改。
- 虽然不是构建全部的代码，但是代码量就在那里，初始化时还是很慢
- 多个项目之间依赖管理复杂：可以通过`workspace`以及`changeset`解决

`workspace + changeset + Monorepo`解决了工程管理的这三个问题：
1. 手动`npm link`时，是先link到全局，然后再引入到本地的。如果子项目很多，就很麻烦。

`workspace`帮我们解决了这个麻烦，安装依赖时会自动软链接。
> [!NOTE]
> `yarn workspace`是将所有子项目都软链接到根目录的`node_modules`中。
> 
> `pnpm workspace`是将子项目依赖的本地包软链接到当前`node_modules`中。

2. 子项目的命令执行问题：如果需要同时打包多个子项目，没有统一的命令就会很麻烦，需要一个一个去执行。

`workspace`提供了统一的执行命令。
另外如果这些子项目之间有强关联的依赖关系，比如A项目需要访问到B项目，这种情况，如果先启动了A项目，就会报错，因为B项目还没有启动。
`pnpm workspace`可以解决这种问题，按照顺序来执行。

3. 版本更新时，对应项目的依赖管理问题：比如A依赖的B，只修改了B，对应的A也应该更新，但是这种依赖关系单纯靠人去判断可能会有遗漏。

`changeset`可以很好的解决这个问题。通过git diff找到修改的项目，并且会自动找到所有依赖了该项目的项目，自动更新版本号。

## 方案

现在一般都是`workspace`+`changeset`配合`monorepo`使用的

### yarn workspace

使用`yarn workspace`:
> [!NOTE]
> 需要有项目文件以及`package.json`文件
>
> 假设有以下两个子项目：
>
> -- packages
>
> ---- page
>
> ---- utils

生成`workspace`配置：
```bash
# 进入子目录中 执行命令 会在根目录的package.json文件中自动生成workspace字段。
npm init -w
```
有了`workspace`配置，在根目录执行`yarn`安装依赖时就会**将子项目软链接到根目录的`node_modules`中**。

如果需要安装本地依赖，比如在`page`中安装`utils`:
```bash
yarn workspace page add utils@1.0.0
```
> [!IMPORTANT]
> 特别注意 这里需要指定版本号，否则会从npm仓库中查找下载

如果安装非本地依赖，比如安装`typescript`:
```bash
yarn workspace page add typescript
```
> [!NOTE]
> 删除依赖只需要将`add`改为`remove`即可。

子项目的依赖都是放在根目录的`node_modules`中，当然`package.json`中也有会记录。

> [!NOTE]
> 以上命令和直接进入子项目目录执行`yarn add`命令是一样，也会把依赖安装到根目录
>
> 提供这么一个在根目录使用的命令 是**为了方便管理，不用频繁的切换目录**。

在根目录执行：
```bash
yarn workspace page run build

yarn workspaces run build
```
这两个命令是用来执行子项目的命令的，也是**为了方便管理，不用频繁的切换目录**。

如果想要查看依赖之间的关系，可以使用`yarn workspaces info`命令。

#### `changeset`
如果使用`changeset`来**解决依赖升级后的更新问题**：
```bash
# 安装changeset
yarn workspace add @changesets/cli -D
```
接着就是使用`changeset`:
- 初始化：
```bash
npx changeset init
```
会在根目录生成一个`.changeset`文件夹，注意里面有一个`config.json`文件，这个文件是用来配置`changeset`的。

- 依赖更新后
```bash
npx changeset add
```
当修改完成准备提交的时候，执行这个命令，该命令会要求用户选择更新的包、版本号以及本次更新描述。
输入完成之后会在`.changeset`中生成一个临时文件，记录了本次更新的相关信息。
> [!NOTE]
> 是根据git记录来找到修改的文件的，所以要有一次commit记录。
> 并且`changeset`默认是`main`分支，如果分支不对 是找不到变化的文件的，只能手动选择。

- 更新项目以及依赖的版本号
```bash
npx changeset version
```
输入了相关更新信息之后，执行该命令：
比如A依赖了B，只修改了B，B的版本号会修改，即使没有选中A，也会修改A的版本号(patch版本号1.0.0 -> 1.0.1)。并且都会生成`CHANGELOG.md`文件。
1. 根据用户给的信息来修改相关包以及依赖的版本号，并生成`CHANGELOG.md`文件。
2. 会自动判断其他项目有没有使用更新的包，如果有的话也会更新版本号。

- 提交发布
```bash
git add .
git commit -m "xxx"
npx changeset publish
```
会自动执行`git push`以及`npm publish`，而且还会打上tag。

### pnpm workspace

使用`pnpm workspace`时和上述没有什么太大区别，主要是提供的命令使用上有些区别，`changeset`的使用方式完全相同。

`workspace`的配置是手动的，只需要指定文件夹即可。
手动创建一个`pnpm-workspace.yaml`文件，配置如下：
```yaml
packages: 
  - 'packages/*'
```
创建好`workspace`之后，执行`pnpm install`是**不会将子项目软链接到根目录的**，只有安装了相应子项目**作为依赖时才会软链接到对应项目**中。
比如有两个子项目，`page`和`utils`。
执行`pnpm -F page add utils --workspace`，会将`utils`软链接到`page`的`node_modules`中，并且`package.json`添加以下依赖：
```json
"dependencies": {
  "utils": "workspace:^"
}
```
可以看到，`utils`的版本号是`workspace:^`，表示依赖的是`workspace`中的版本号，等发布时会自动替换成对应的实际版本。

如果需要安装通用的依赖，即在根目录安装依赖：
```bash
pnpm add typescript -w
```
需要加上`-w`参数才能安装，否则会有一个警告提示。

也提供了在根目录执行子项目的命令：
```bash
pnpm -F cli exec xxx
pnpm -F cli exec npx tsc --init
pnpm -F cli exec pnpm run build

pnpm -r run build
```

### 区别

可以看到，这两种方式并没有太大的区别，最大的区别就是`pnpm workspace`可以按照顺序来执行命令。

另外还有一些细微的区别，比如子项目的软链接位置不同。
