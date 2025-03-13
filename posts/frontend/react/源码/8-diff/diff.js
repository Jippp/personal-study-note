// 模拟极简的diff算法(react中第二轮-before和after都没有遍历完的阶段，直接从after开始遍历)
// 比较前后状态，判断节点是新增、删除、移动？

// 对节点标记，diff后判断节点状态
/** 没有的节点为新增，有的节点为移动位置 */
const PLACEMENT = 'Placement';
/** 节点删除 */
const DELECTION = 'Deletion';

// 节点的样子: Node = { key: string; flag?: Flag; index?: number }

/**
  期待diff的行为：
  example1: 
    before = [
      { key: 'a' }
    ]
    after = [
      { key: 'b' }
    ]
    diff(before, after) => [
      { key: 'b', flag: PLACEMENT },
      { key: 'a', flag: DELECTION }
    ]
  example2: 
    before = [
      { key: 'a' },
      { key: 'b' },
      { key: 'c' },
    ]
    after = [
      { key: 'c' },
      { key: 'b' },
      { key: 'a' },
    ]
    diff(before, after) => [
      { key: 'b', flag: PLACEMENT },
      { key: 'a', flag: PLACEMENT }
    ]
*/
/**
 * 比较前后的节点，为节点添加flag标记
 * @param {*} before Node
 * @param {*} after Node
 * @returns
 */
function diff(before, after) {
  const result = [];

  // 建立以before中key为key，节点为value的索引，便于查找
  const beforeMap = new Map();
  const beforeIndexMap = new Map();
  before.forEach((item, i) => {
    beforeMap.set(item.key, item);
    beforeIndexMap.set(item.key, i);
  });

  // 遍历after，判断节点状态
  const len = after.length;
  // 记录上一个可复用的节点在before中的索引，用于后续判断节点状态
  let lastPlacedIndex = 0;
  let i = 0;
  for (; i < len; i++) {
    const cur = after[i];
    const beforeNode = beforeMap.get(cur.key);
    if (beforeNode) {
      const beforeIndex = beforeIndexMap.get(cur.key);
      // 在map中删除
      beforeMap.delete(cur.key);

      // after中当前节点在before中的索引大于等于最后一个可复用节点的索引
      // 说明当前节点不需要移动并更新lastPlacedIndex，否则该节点位置发生变化
      // 这里可以反过来想：既然遍历到了该节点，之前的一定都是检查过的，如果更新后的索引小于最后一个可复用节点索引，则该节点位置一定是变化的
      if (beforeIndex < lastPlacedIndex) {
        cur.flag = PLACEMENT;
        result.push(cur);
      } else {
        lastPlacedIndex = beforeIndex;
      }
    } else {
      // 在before中没有该节点，标记为新增
      cur.flag = PLACEMENT;
      result.push(cur);
    }
  }

  // 遍历了after之后，如果map中还有值，那就表示该值被删除了
  for (let [_, node] of beforeMap) {
    node.flag = DELECTION;
    result.push(node);
  }

  return result;
}

// 测试
const before = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
const after = [{ key: 'c' }, { key: 'b' }, { key: 'a' }];
console.log('demo1', diff(before, after));
const before1 = [{ key: 'a' }];
const after1 = [{ key: 'b' }];
console.log('demo2', diff(before1, after1));
