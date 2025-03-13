---
date: 2024-10-18
title: Next项目-ReactNote项目总结
category: Next
tags:
- frontend
- Next
description: 通过一个简单的笔记项目，学习一下Next的知识点
---

# Next项目-ReactNote项目总结

该项目在`next/reactNote`分支可以查看

## 项目介绍

Next.js v14 基于 React Server Component 构建的 App Router。该Demo是介绍React Server Component时介绍的Demo。

## Demo内容

笔记系统，可以增删改查笔记，笔记支持 markdown 格式。

首页界面分为两列，左侧是笔记列表，右侧是笔记内容。
左侧可以新建笔记、搜索笔记；右侧预览时可以删除、编辑笔记。

路由：
- 首页/
- 笔记预览/notes/[id]
- 编辑笔记/notes/edit/[id]
  - 编辑之后保存跳转到预览页面/notes/[id]
- 新建笔记/notes/new
- 搜索笔记/notes?q=[query]


