---
private: true
date: 2025-04-16
title: 详细介绍MCP
# category: AI
# tags:
# - AI
# description: 详细介绍MCP
---

先放个链接，后面记得学习

> https://mp.weixin.qq.com/s/yP6D_mnxwFsL3SbC4qZnYg

## 出现MCP的背景

出现一个新技术必然是现有技术存在局限性，MCP的出现是为了弥补大模型数据库有限的问题。

每家公司推出的大模型都有自己的训练集，但是这个训练集是有限的，并不是什么资料都有，比如公司的隐私资料。想要大模型将公司的隐私资料添加进训练集，现在就几种方案：

- 微调成本太高，需要重新训练，并且时间周期较长，虽然最后的效果很高；
- RAG：检索增强生成。相对微调来说要简单很多，但是精准度并不高，最终效果并不理想。
- Function Call：让大模型能和外部系统交互，从而完成特定任务。

MCP和Function Call非常接近，或者说就是对Function Call的一种规范化的协议。

Funciton Call提供了大模型和外部系统交互的能力，比如大模型遇到无法直接回答的问题，就会调用Function Call(天气查询、位置查询等)获取到信息后再生成回答。

但是每家大模型为了保持独特性，提供的接口各不相同，一个相同的Function Call在A公司的大模型能用，但放到B公司的大模型就不适用了。

所以在这种情况下，MCP就出现了。

## MCP基础知识

MCP全称Model Context Protocol模型上下文协议，是由`Anthropic`公司(Claude大模型)推出的一个开放标准协议。

> [!NOTE]
> https://norahsakal.com/blog/mcp-vs-api-model-context-protocol-explained/

通过MCP这个统一的规范，让大模型不管是连接数据库、第三方API、或访问本地文件等各种外部资源，都更加的标准化、可复用。

分为三个部分：
- MCP Host：大模型客户端，一般是AI Agent；
- MCP Client：一般是在大模型客户端实现的；
- MCP Server：提供服务的；

通过MCP这个协议将MCP Client和MCP Server连接起来，让MCP Host能访问到MCP Server提供的能力。

开发者按照MCP协议进行开发，不需要再去考虑不同模型的兼容问题，可以节省开发的工作量；另外开发出来的MCP Server，因为是通用协议，所以直接直接开放，推动了AI的发展。

### MCP Server

是一个轻量级的应用程序，通过标准化的模型上下文协议即MCP公开特定功能。

简单来说就是让大模型能访问特定的数据源或调用特定工具。

常见的MCP Server如：
- 文件和数据访问类：让大模型能操作、访问本地文件或数据库
- Web自动化类：让大模型能操作浏览器，实现自动化流程
- 第三方工具集成类：让大模型能调用第三方平台暴露的API，如高德的MCP Server；

## MCP的简单使用

## MCP核心原理
