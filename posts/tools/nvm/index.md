---
date: 2024-12-17
title: nvm的使用
category: Tools
tags:
- Tools
description: nvm的日常使用注意事项
---

# NVM

nvm是一种用来管理node版本的工具。

有的时候安装新的node版本，会报错：
```bash
Get "https://nodejs.org/dist/index.json": dial tcp 104.20.22.46:443: i/o timeout
```

解决方案：

首先找到nvm安装的路径：
```bash
where nvm
```
进入到该路径下，可以找到一个`setting.txt`的文件，添加一下代码：
```txt
node_mirror:https://npmmirror.com/mirrors/node/
npm_mirror:https://npmmirror.com/mirrors/npm/
```

通过淘宝的镜像来安装node新版本。
