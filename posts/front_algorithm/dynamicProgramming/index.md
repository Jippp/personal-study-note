---
date: 2025-03-03
title: 动态规划的解法
category: algorithm
tags:
- algorithm
description: 总结一下动态规划的基本解法
---

## 理论

动态规划，DynamicProgramming 简称DP。通过 **将复杂问题分解为较简单的子问题** 的方式来求解的一种方法。

一般来说用到动态规划基本都是**求最值**的。所以核心原理就是**穷举**。

但是如何**找出所有子问题进行穷举**也是个问题，所以需要先找出状态转移方程，如何将复杂问题拆分为子问题。

然后穷举子问题，如果直接暴力穷举，也会有**重叠子问题**的性能，所以一般要借助缓存(放到动态规划问题里名词叫做**DP Table**)来优化穷举过程。

## 解题步骤

通过上面的分析，可以大概理清动态规划的解题步骤：

1. 分析问题找到最优子结构，也就是子问题是什么
2. 根据最优子结构列出状态转移方程，复杂问题拆分成子问题的合
3. 画出递归树，找出重叠子问题，借助缓存解决问题。

### 如何找出状态转移方程

状态转移方程：描述问题结构的一个数学表达

## 例题训练

经典的斐波那契数列和跳台阶

如斐波那契数列，要解出f(n)，就要找出子问题，f(n-1)和f(n-2)，再递归...直到边界值f(1)和f(2)

- f(n)的最优子结构就是f(n-1)和f(n-2)
- 该问题的状态转移方程就是`f(n)=f(n-1) + f(n-2)`
- 再根据递归树，分析是否有重叠子问题

### 两种方法解决重叠子问题

重叠子问题的根本原因在于是从未知的大问题，分解成一个个未知的小问题，直到已知的边界，再回去求解未知问题而导致的。

所以方向也很明显：
- 自顶向下时是需要求解子问题的，所以只能借助缓存，避免重复处理。
- 换个方向，从已知的边界出发，往上去求解子问题，这样就直接避免了重叠子问题

#### 自顶向下借助缓存

一般来说思路都是如何将未知的大问题，拆分成未知的子问题，递归直到已知边界，再往上求解的。这也就是自顶向下的思路。

但是这种思路会带来重叠子问题，在求解未知子问题时通常都会有重叠部分，进而导致性能问题，只能借助缓存来解决。

比如斐波那契数列的自顶向下的解法：

```js
function fb(target) {
  const dpTable = []
  function run(target) {
    if(target < 2) return target
    if(dpTable[target] !== undefined) return dpTable[target]
    const result = run(target - 1) + run(target - 2)
    dpTable[target] = result
    return result
  }
  return run(target)
}

fb(10)
```

#### 自底向上的解法

如果换一种思路，从已知的边界出发，往上依次求解子问题，就能避免重叠子问题。

这也是动态规划常见的解题方式，不用借助递归，一个循环就能解决问题。

比如斐波那契数列的自底向上的解法：

```js
function fb(target) {
  const dp = [0, 1]
  for(let i = 2; i <= target; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }
  return dp[target]
}
```

还有一种优化方式，即尝试缩小缓存，比如上面遍历中，用到的始终只有后两个，所以可以用两个变量来存储，遍历时更新即可：
```js
function fb(target) {
  if(target < 2) return target
  let dp1 = 0, dp2 = 1
  let result = 0
  for(let i = 2; i <= target; i++) {
    result = dp1 + dp2
    // 更新
    dp1 = dp2
    dp2 = result
  }
  return result
}
```
这种优化可以常量空间解决问题。

### 凑零钱问题

问题描述：有K个面值分别是[c1, c2, c3]的硬币，硬币的数量无限，给个总金额amount，问**最少**多少硬币可以凑出这个总金额。如果凑不出来，返回-1

解题思路：
找出能凑齐总金额的所有可能，比如总金额是11，面值是[1, 5, 10]。
11拆分：10 6 1
  10拆分：9 5 0
    ...
  6拆分：5 1 -1
    ...
如果余额为0，说明满足条件，
如果面值大于余额，说明不能满足条件。
最后比较最小值即可

1. 确定**状态**，即原问题和子问题中的变量。硬币数量无限、金额固定，所以变量就是金额总和。
2. 状态确定之后，需要去确定导致**状态变化的行为**：在选择硬币之后，总金额就会随之减小，即状态发生了变化。
3. 根据状态以及状态变化的行为，去列出**状态转移方程**。

状态就是总金额，也可以看做余额，状态变化的行为就是选择了硬币。

f(amount) = f(amount-coins[i])+....f(amount-coins[0])

本题求解的问题是最少硬币数量，即**可行方案递归的深度**。

所以自顶向下的代码如下：
```js
function coinsChange(coins, amount) {
  // 缓存，解决重叠子问题
  const dpTable = []

  function dp(coins, amount) {
    if(amount === 0) return 0
    if(amount < 0) return -1

    if(dpTable[amount] !== undefined) return dpTable[amount]

    let result = Infinity
    for(let i = 0; i < coins.length; i++) {
      const temp = coinsChange(coins, amount - coins[i])
      if(temp < 0) cotinue
      // 求的是递归深度，所以这里需要加1
      result = Math.min(result, temp + 1)
    }

    dpTable[amount] = result === Infinity ? -1 : result

    return dpTable[amount]
  }

  return dp(coins, amount)
}

console.log(coinsChange([1,5,10], 13))
```

如果是自底向上的思路，即从余额为0开始，到余额等于amount结束。
```js
function coinsChange(coins, amount) {
  // dp数组，索引是余额，值是凑齐余额的最少硬币数量
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0

  // 外层循环是为了自底向上时找到amount
  for(let i = 0; i < dp.length; i++) {
    // 内存循环是尝试累加，找到通往amount的路径
    for(const coin of coins) {
      // 如果当前余额小于面值，直接跳过
      if(i < coin) continue
      // 当前余额-当前面值的最少硬币数+1 是路径深度
      dp[i] = Math.min(dp[i], dp[i - coin] + 1)
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}

console.log(coinsChange([1,5,10], 13))
```

