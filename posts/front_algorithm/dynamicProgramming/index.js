// function coinsChange(coins, amount) {

//   const dpTable = {}

//   function dp(coins, amount) {
//     if(amount === 0) return 0
//     if(amount < 0) return -1

//     if(dpTable[amount] !== undefined) return dpTable[amount]

//     let result = Infinity
//     for(let i = 0; i < coins.length; i++) {
//       const temp = dp(coins, amount - coins[i])
//       if(temp === -1) continue
//       result = Math.min(result, temp + 1) 
//     }

//     dpTable[amount] = result === Infinity ? -1 : result

//     return dpTable[amount]
//   }
//   return dp(coins, amount)
// }

// function coinsChange(coins, amount) {
//   // 索引是金额，value是凑齐该金额的最少硬币数量
//   const dpTable = new Array(amount + 1).fill(Infinity)

//   dpTable[0] = 0

//   for(let i = 0; i < dpTable.length; i++) {
//     for(const coin of coins) {
//       // i-coin是剩下的余额
//       if(i - coin < 0) continue

//       // dpTable[i-coin]+1 是为了获取层级的
//       dpTable[i] = Math.min(dpTable[i], dpTable[i - coin] + 1)
//     }
//   }
//   return dpTable[amount] === Infinity ? -1 : dpTable[amount]
// }

// console.log(coinsChange([1,5,10], 13))

/* 给你一个整数数组 nums ，找到其中最长严格递增子序列的长度。
  输入：nums = [10,9,2,5,3,7,101,18]
  输出：4
  解释：最长递增子序列是 [2,3,7,101]，因此长度为 4 。
*/

/* 
[0,1,0,3,2,3]
[1,2,2,]
*/

function run(nums) {
  if(!nums.length) return 0
  // 索引为nums的长度，值是当前nums.slice(0, i)的最长递增子序列
  const dp = new Array(nums.length + 1).fill(1)
  let max = 0
  for(let i = 1; i < dp.length; i++) {
    const target = nums[i]
    // 遍历nums的0-i，如果小于当前值
    for(let j = 0; j < i; j++) {
      if(nums[j] < target) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
      }
    }
    max = Math.max(max, dp[i])
  }
  return max
}

console.log(run([10,9,2,5,3,7,101,18]))
console.log(run([0,1,0,3,2,3]))
