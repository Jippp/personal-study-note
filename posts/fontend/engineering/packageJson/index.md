---
date: 2024-12-23
title: package.json的常见字段
category: engineering
tags:
- fontend
- engineering
description: 介绍package.json中的常见字段
---

# package.json文件中的常见字段

## 依赖相关的字段

依赖主要有两个场景，一个是当前项目中的依赖，一个是项目中依赖的依赖

### dependencies

当前项目运行时需要的依赖项

#### 项目

在安装包时需要考虑一下，是否在运行时需要。在`install`时在`dependencies`中声明的依赖都会被下载。

#### 项目中的包

如果项目中的依赖`package.json`的`dependencies`中声明了一个包，那么主项目在安装依赖时也会安装这个包。

比如主项目中安装了一个A依赖，A依赖的`dependencies`中有一个B依赖。主项目安装A依赖时会同时安装B依赖。

### devDependencies

在开发环境下需要用到的依赖项

#### 项目

如果某些依赖项只在开发时用到，就可以放到这里来，比如一些类型定义的包`@types/xxx`。

`install`时`devDependencies`声明的依赖项也会被安装，如果`install --production`指定了`NODE_ENV=production`，那么是不会安装`devDependencies`中的依赖项，一些`CI/CD`环境可能会遇到这种问题。

#### 项目中的包

如果是项目中依赖的`devDependencies`，主项目安装依赖时会忽略掉的。

### peerDependencies

该声明一般用于依赖包中(组件库等)，表示如果需要安装本依赖，还需要安装哪些依赖。

#### 项目中的包

主项目安装依赖时，并不会自动安装`peerDependencies`(npm v7之后 是会自动安装的)，但是包管理器会检查主项目中的依赖项和`peerDependencies`中声明的依赖项版本是否匹配，如果不匹配或者没有相关依赖项，会给个警告。

比如主项目是一个React项目，该项目中引入了一个React组件库，这个组件库的`package.json`中`peerDependencies`中声明了`react`，那么主项目在安装这个组件库时，会检查主项目中是否有`react`，如果没有或者版本不同会给个警告。

这个字段主要是用来**避免项目和依赖出现相同的安装包**

### peerDependenciesMeta

对`peerDependencies`的一个补充说明，让`peerDependencies`中的依赖项变为可选的。

### optionalDependencies

该字段用来定义**可选依赖项**

#### 项目

`install`是会安装，但是安装失败不会中断，也不应该影响程序的正常运行。

所以在项目代码中应该要**判断依赖是否存在才能使用**

#### 项目中的包

`install`是会被安装，但是安装是否不会中断。

### bundledDependencies

该字段的value是一个数组，需要配合`dependencies`才能使用。主要用在依赖中，在打包的时候会将这里声明的依赖项一起打包。主项目安装该依赖时，会直接使用`bundledDependencies`打包好的依赖，而不是按照`dependencies`来安装。

简单点理解就是，在这里声明的依赖项是固定的，并且会提供给主项目使用。

该字段也接受boolean值，true时表示打包所有的依赖。

## 文件相关

### browser

umd的入口文件

### main

commonjs的程序入口文件，没有的话默认是根目录下的index.js

### module

ESModule的程序入口文件

### unpkg

unpkg的程序入口文件(通过script的方式引入)

### type

描述当前程序中所有文件的类型定义。有`module`、`commonjs`或者不设置、`umd`、`json`

- module：将当前程序中的所有文件都认为是ESM类型的
- commonjs/不设置：认为是CommonJS类型的

### exports

如果有该字段，会忽略掉main\browser\module\types这些字段。是用来配置多个入口文件的。

```json
exports: {
  ".": {
    // esm的入口文件
    "import": "./dist/esm/index.js",
    // commonjs的入口文件
    "require": "./dist/commonjs/index.js",
    "browser": "./dist/umd/index.js",
  }
}
```

### files

指定哪些文件会被推送到npm服务器，是一个数组。
