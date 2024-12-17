---
date: 2024-12-17
title: Cloudflare的一些用途
category: Tools
tags:
- Tools
description: Cloudflare的一些实际使用
---

# Cloudflare的一些用途

提供了worker，一种简单的代理服务器，一些简单的脚本可以通过这个来实现。
比如github action的cron并不准确，就可以通过这个来实现准点的触发：

1. 在github action的配置文件中添加
```yml
on:
  # 用来在github action上手动触发的
  workflow_dispatch:
  # cloudflare run
  repository_dispatch:
    types: [cloudflare-run-sendmail]
```
2. 然后进入cloudflare的worker页面，新建一个worker，添加以下代码：
```js
// 定时任务触发的事件
addEventListener('scheduled', event => {
  event.waitUntil(handleRequest(event))
})

async function handleRequest(event) {
  // 地址由https://api.github.com/repos/`github仓库地址`/dispatches
  const modifiedRequest = new Request("https://api.github.com/repos/Jippp/review/dispatches", {
    method: "POST",
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      // token是在github -> settings -> Developer Settings 创建一个token 一定要选中repo权限
      // https://github.com/settings/tokens
      'Authorization': 'someToken',
      'Content-Type': 'application/json',
      'User-Agent': 'xxx',    // GitHub用户名
    },
    body: JSON.stringify({
      'event_type': 'cloudflare-run-review',    // {type}填写触发事件的对应类型，即前面GitHub Actions配置中types的给定值
    }),
  });

  const response = await fetch(modifiedRequest);

  const modifiedResponse = new Response(response.body, response);

  return modifiedResponse
}
```