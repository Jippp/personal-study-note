---
date: 2024-09-19
title: react源码8-diff
category: react
tags:
- fontend
- react
description: React diff算法原理
---
# React中diff算法的大致逻辑

---

[具体实现代码](https://github.com/Jippp/personal-study-note/blob/master/posts/fontend/react/%E6%BA%90%E7%A0%81/8-diff/diff-all.js)

React中对diff算法做了几个限制，防止时间复杂度过高：

+ 只会对同级元素进行diff，如果同一个元素前后跨层级了，那么就会直接销毁掉原来的，新建一个新的
+ key值相同，type不同时，会直接销毁掉该元素及其子孙节点，并新建一个新的

在React源码中在`render`阶段对新旧fiber节点作了diff处理
入口函数为`reconcileChildFibers`， 在该函数中，react会根据`newFiber`的`tags`的不同做出不同的处理

> 其中对单文本的节点，react会做特殊的处理，不会对比key，因为没有挂载key的地方，会直接新建一个Fiber

可以将react处理的节点类型大致分为两种，一种是单节点，另一种是多节点

## 单节点diff

单节点的diff比较简单，直接对比key是否变化：

+ 如果key发生了变化，删除该节点，新建一个Fiber
+ 如果没有发生变化，会再判断type是否相同，如果相同，会复用该节点，否则删除新建一个Fiber

需要注意的是，如果key不同，删除的仅是该节点；如果key相同，type不同，会删除该节点及其子孙节点。也就是说，key不同，react会继续检查其子孙节点，判断是否可以复用；但是如果key相同但是type不同，就会直接根据`newChildren`新建一个Fiber，并不会继续检查子孙节点

## 多节点diff

多节点的diff比较复杂，可能有插入、删除、更新这三种操作，但是在日常开发过程中，更新操作占比更大。所以多节点的diff过程，会对更新操作的判断放在最前面

多节点diff会遍历`newChildren`以及`oldFiber`，依次对比

第一轮遍历中，会根据`newChildren`的index和`oldFiber`的index找到需要对比的节点，根据key和type来判断是否可以复用，如果不能复用，直接跳出第一轮遍历；如果可以复用，继续判断`oldFiber`的`sibling`节点是否可以复用，直到遍历完`oldFiber`或`newChildren`

第一轮遍历结束之后，有四种情况：

1. `oldFiber`和`newChildren`都遍历完了，那么不需要第二轮遍历，在第一轮中已经更新了Fiber，diff结束
2. `newChildren`没有遍历完，`oldFiber`遍历结束，表示有节点插入，那么在第二轮中需要遍历接下来的`newChildren`添加`Placement`标记
3. `newChildren`遍历完，`oldFiber`没有遍历完，表示删除节点，在第二轮需要遍历接下来的`oldFiber`，将剩下的`oldFiber`添加进待删除列表(fiber.delections)，添加删除标记
4. `newChildren` `oldFiber`都没有遍历完，表示有节点改变了位置

2、3情况都比较简单，关键是第四种情况，第四种情况说明了有节点位置发生了改变，react中根据最后一个可复用的节点在`oldFiber`中的索引`lastPlacedIndex`作为移动的参照物

react在第二轮遍历中作了如下处理：
首先根据剩下的`oldFiber`建立了一个`key(没有的话为index)为key，节点为value的map映射`，因为这种情况是节点位置改变，不能在通过索引来找到需要对比的节点
然后遍历剩下的`newChildren`，根据`key`来找到需要对比的节点，再根据`newChildren`的节点在剩下的`oldFiber`中的索引`oldIndex`和`lastPlacedIndex`的大小来判断节点是否发生移动：

+ 如果`lastPlacedIndex`要大，说明节点需要移动，为节点添加`Placement`标记
+ 如果`lastPlacedIndex`要小，说明节点不需要移动，将`lastPlacedIndex`赋值为`oldIndex`

直到newChildren遍历结束，完成diff算法

## 两个简单的例子理解diff

1. 更新前abcd 更新后acbd

```text
  oldFiber: abcd
  newChildren: acbd
  第一轮遍历中：
    index = 0, newChildren[0]key为a oldFiber对应的key也为a, 直接复用
    index = 1, newChildren[1]key为c oldFiber对应的key为b, 跳出第一次遍历，lastPlacedIndex = 0
  第二轮遍历中：
    oldFiber: bcd
    newChildren: cbd
    遍历newChildren：
      key为c的，在oldFiber中oldIndex = 1，oldIndex > lastPlacedIndex，该节点不需要移动，lastPlacedIndex = oldIndex = 1
      key为b的，在oldFiber中oldIndex = 0，oldIndex < lastPlacedIndex，该节点需要移动，添加Placement标记
      key为d的，在oldFiber中oldIndex = 2， oldIndex > lastPlacedIndex, 该节点不需要移动
    diff结束
    最后，b被标记为移动
```

1. 更新前abcd 更新后dabc

```text
  oldFiber: abcd
  newChildren: dabc
  第一轮遍历中：
    index = 0, newChildren[0]key为d，oldFiber中对应key为a，key不相同，lastPlacedIndx = 0,跳出第一轮遍历
  第二轮遍历中：
    oldFiber: abcd
    newChildren: dabc
    遍历newChildren：
      key为d的，在oldFiber中oldIndex为3，oldIndex > lastPlacedIndex，该节点不需要移动，lastPlacedIndex = oldIndex = 3
      key为a的，在oldFiber中oldIndex为0，oldIndex < lastPlacedIndex，该节点需要移动，添加Placement标记
      key为b的，在oldFiber中oldIndex为1，oldIndex < lastPlacedIndex，该节点需要移动，添加Placement标记
      key为c的，在oldFiber中oldIndex为2，oldIndex < lastPlacedIndex，该节点需要移动，添加Placement标记
    diff结束
    最后，abc被标记为移动
```
