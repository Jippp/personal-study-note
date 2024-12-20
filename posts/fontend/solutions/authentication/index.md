---
date: 2024-12-20
title: 前端鉴权方案
category: Solutions
tags:
- fontend
- Solutions
description: 了解一下前端鉴权方案
---

# 前端的鉴权方案：Cookie、session、token、JWT、单点登录

## 背景

由于HTTP是无状态的，所以需要一种机制来识别用户身份，这就是鉴权。

## Cookie的介绍

最早的时候，浏览器和服务端通过`Cookie`来实现“状态”。

`Cookie`是服务端发送到浏览器，然后存储在浏览器的一段文本，每次请求都会带上`Cookie`，服务端通过解析`Cookie`来识别用户身份：

- `Set-Cookie`字段：响应头字段，服务端通过这个字段来设置`Cookie`的

```ini
Set-Cookie: username=xx; domain=xxx.com; path=/; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly
```
> [!NOTE]
> 一次`Set-Cookie`只能携带一条数据，如果要多条数据，添加多个`Set-Cookie`字段。

- 然后后续的请求时，浏览器会自动带上`Cookie`发送给服务端。

### Cookie的组成

- `name=value`：键值对，表示信息，是必须要有的。

- `domain`：`Cookie`的域名，只有在这个域名下浏览器才会自动发送。如果没有指定，默认是当前域名的一级域名，如`www.baidu.com`会被设置为`baidu.com`。
- `path`：`Cookie`的路径，只有在这个路径下才会发送。默认是`/`。

- `Expires`：`Cookie`的过期时间，是一个具体的UTC时间，浏览器根据本地的时间来比较，如果过期了就会删除，因为是本地时间，所以不准确。如果不设置或者是null，那么`Cookie`会在当前浏览器窗口关闭时删除。
- `Max-Age`：`Cookie`的过期时间，秒级单位。
  - 小于0时，会话型`Cookie`，浏览器关闭时删除。
  - 等于0时，会立即删除。
  - 大于0时，持久型`Cookie`，浏览器会保存到过期时间。

> [!NOTE]
> 同时存在`Expires`和`Max-Age`时，`Max-Age`优先级更高。
>
> 如果两者都没有设置，那么`Cookie`会在当前浏览器窗口关闭时删除。

- `Secure`：只有在HTTPS下才会发送，一般不需要指定值。是一个开关，不需要手动设置，如果是HTTP，会自动忽略服务端设置的`Secure`；如果是HTTPS，发送给服务端时会自动带上`Secure=true`。
- `HttpOnly`：只有在HTTP请求中会发送，而不会被JavaScript读取。

- `SameSite`：让Cookie在跨站时不发送，防止CSRF攻击。
  - `Strict`：完全禁止第三方Cookie，跨站点时不会发送Cookie，只有当前页面的URL和请求的URL完全一致时才会发送。
  - `Lax`：在跨站点的情况下，只有在GET请求中才会发送Cookie，这样基本就能防止一些中间网站的脚本攻击。是默认值
  - `None`：无论是否跨站点，都会发送Cookie。HTTP协议不接受该值。

## Session鉴权

`Session`指的是存储在服务端的一些认证信息，比如用户身份。然后基于`Cookie`机制，就能实现鉴权的功能。

- 首次登录时，将账号密码发送给服务端，服务端验证通过后，生成一个`Session`，然后将`Session`的ID存储到数据库、Redis等地方。
- 然后将`Session`的ID放在`Set-Cookie`中发送给浏览器。
- 后续的请求时，浏览器会自动带上`Cookie`，服务端通过解析`Cookie`，去校验是否有效，从而识别用户身份。

### 缺点

服务端给浏览器的是一个id，实际的身份信息都是存在服务端的，怎么存储就成了一个问题。因为服务端通常是要做负载均衡的，多台不同的服务器怎么才能访问到同一个地方？通常是放到独立的Redis里的；还可以复制`Session`，每个服务器都放一份不就好了(内存太多了，而且更新也是个问题)。

另外是基于`Cookie`的，所以在跨域上可能有些问题。比如www.taobao.com和www.tmall.com，是一家公司的，但是是不同的域名，所以`Cookie`是不会共享，需要手动去修改的：

- 前端请求时手动添加`withCredentials: true`
- 服务端设置:
```markdown
Access-Control-Allow-Origin: '允许的域名'
Access-Control-Allow-Credentials: true
```

> [!NOTE]
> 这里的Access-Control-Allow-Origin 必须是具体的域名才能接收跨域的Cookie，*都不可以。
>
> 另外手动设置的请求头，ajax中是withCredentials: true；fetch中是credentials: "include"

## token鉴权

正是因为`Session`存储上的缺点，所以有了`token`鉴权。

因为用户信息通常不会很多，所以干脆将所有的信息都放到`Cookie`里存。将这些信息转成`token`，发送给浏览器，之后每次只需要解析`token`就能识别用户身份。

`token`实际就是一个`base64`编码的字符串，里面包含了用户的信息，然后服务端通过解析`token`来识别用户身份。

## JWT

`JWT`是`JSON Web Token`的缩写，是`token`的改进版本，不基于`Cookie`来实现了。`JWT`是用json格式来保存的，是一段通过加密之后的字符串，比如存到请求头为`authorization: xxxyyy`。

`Session`是将信息存在了服务端，这里将信息存到客户端，直接放到`Header`中。

`Token`分为三部分`header\payload\verify signature`

- `header`保存当前的加密算法
- `payload`是具体要存的数据
- `verify signature`是将`header`和`payload`加盐之后加密生成的。

将这三部分分别用`Base64`编码一下，最后拼到一块就是`Token`，将`Token`存到`某个自定义的header`中。
```markdown
authorization: Bearer xxxx.yyyy.zzzz
```

请求时将该`自定义的header`带上，服务端就可以解析出对应的`header、payload、verify signature`，然后根据`header`中的算法进行验证。

具体流程就是：第一次登录时，用户输入一些信息通过接口将信息给服务端，服务端进行加密处理，将`JWT`返回给前端，前端本地保存下来，之后的请求手动带上去服务端进行验证。

没有百分百的安全，`JWT`也有自己的问题：

- 安全：因为`JWT`是将数据通过`Base64`编码，所以基本是明文的，所以必须要配合`HTTPS`来使用。

- 性能：每次请求都会带上这个`Token`，会多传输一些字节，传输速度肯定会收到影响。另外服务端进行加密、解密的计算，也有一定的压力。所以不能存储太多的信息。

- JWT无法失效：因为信息保存在了客户端，服务端就没有办法来手动控制比如`修改密码后下线重新登陆`等操作。
> [!NOTE]
> 可以配合`Redis`来使用，在`Redis`中记录每个Token对应的生效状态，每次先去`Redis`中看`JWT`是否可用，然后再去验证，这样也能实现功能。

### 双Token方案

现在一般是双Token，一个是`access_token`有效期短；一个是`refresh_token`有效期长，一个星期或者更长。
- `access_token`：用于访问资源，有效期短，一般是几分钟到几小时。
- `refresh_token`：用于刷新`access_token`，有效期长，一般是一周或者更长。

流程如下：
1. 用户登录，服务端验证通过后，生成`access_token`和`refresh_token`，然后将`access_token`和`refresh_token`发送给浏览器。
2. 浏览器每次请求时，会带上`access_tone`，服务端通过解析`access_token`来验收是否有效(身份和时效)。
3. 如果`access_token`过期，客户端应该携带`refresh_token`再到服务端生成一个新的`access_token`（这是需要前端来做的），然后将之前的请求重新发送（这也是前端的工作）。
4. 如果`refresh_token`也过期，那么用户需要重新登录（也是需要前端来处理的，一般是根据响应码重定向到登录页）。

## 单点登录

场景就是多个不同的页面可以实现登录一次，所有的页面都能通用。

原理也很简单，都去一个中间服务器认证，得到凭证之后，存在当前的服务器上，这样就可以获得认证权限了。

和第三方登录的原理实际是一样的：比如A是第三方的域名，B是当前的域名

一开始访问B是没有认证的，所以会带上B的域名跳转到A去认证，登录A校验通过之后，生成一个code，带上这个code重定向回B，会先经过B的服务端，服务端拿到这个code去访问sso服务(也就是A提供的认证平台)，如果有效了，就可以将认证信息(B服务端处理的)返回给B了，这样就不会有跨域的问题。
