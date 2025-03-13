/**
 * 尝试写出完整的diff过程：即两轮遍历
 * 第一次遍历
 *  建立旧节点的index-value map。
 *  遍历map，通过索引依次比较新旧节点的key以及type，如果不能复用 退出遍历
 *
 * 第一次遍历结束有以下几种结果：
 *  1. 新旧节点列表都遍历结束，能直接复用，不需要第二次的遍历了。
 *  2. 新节点列表遍历结束、旧节点没有，有删除的节点，且删除的节点是最后剩下的
 *  3. 旧节点列表遍历结束、新节点没有，有插入的节点，且插入的节点是新节点列表剩下的
 *  4. 新旧节点列表都没有遍历完，说明有节点位置变动
 *
 * 第二次遍历
 *  考虑到更新的频率比插入和删除要多，所以优先考虑更新的情况即结果4
 *   可能有位置变动，所以索引已经不能作为判断依据了，根据旧节点列表建立一个key-value 的map
 *   然后遍历新节点列表，初始化一个lastPlacedIndex作为参照物，这个lastPlacedIndex是最后一个可复用节点在旧节点列表中的索引
 *  
 *   lastPlacedIndex是在老队列中最右边的位置，接着遍历新元素时如果该元素在老队列中的位置超过了最右边的，说明该节点不会影响新元素的顺序，
 *   所以 newDomInOldIndex < lastPlacedIndex 该节点会影响新元素的顺序，所以需要移动该元素。
 * 
 *   接着根据新节点在旧节点列表中索引index 与 lastPlacedIndex 做比较：
 *     index < lastPlacedIndex 说明新节点 要移动位置
 *     其余情况 直接复用节点，更新lastPlacedIndex即可
 *   如果新节点在map中没有找到，说明是新增的，也需要添加对应tag
 */

const PLACEMENT = 'placement';
const DELECTION = 'delection';

class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value || null;
  }
}

function diff(oldList, newList) {
  const result = [];
  let lastPlacedIndex = -1;

  // 第一轮遍历
  for (let i = 0; i < oldList.length; i++) {
    const oldItem = oldList[i];
    const newItem = newList[i];
    if (newItem && oldItem && newItem.key !== oldItem.key) {
      lastPlacedIndex = i;
      break;
    } else {
      // newItem没有值
      if (!newItem) {
        lastPlacedIndex = newList.length;
      } else {
        result.push(oldItem);
      }
    }
  }
  if (lastPlacedIndex === -1) {
    lastPlacedIndex = oldList.length;
  }

  const newListRest = newList.slice(lastPlacedIndex);
  const oldListRest = oldList.slice(lastPlacedIndex);

  // 优先考虑更新的情况，结果4
  if (newListRest.length && oldListRest.length) {
    // 旧列表中key-index的map
    const indexMap = new Map();
    // 旧列表剩余值中key-value的map
    const indexRestMap = new Map();
    oldList.forEach((item, idx) => {
      if (!indexMap.has(item.key)) {
        indexMap.set(item.key, idx);
      }
    });
    oldListRest.forEach((item, idx) => {
      if (!indexRestMap.has(item.key)) {
        indexRestMap.set(item.key, item);
      }
    });

    for (let i = 0; i < newListRest.length; i++) {
      const newItem = newListRest[i];
      const oldItem = indexRestMap.get(newItem.key);
      if (oldItem) {
        indexRestMap.delete(newItem.key);

        const idx = indexMap.get(newItem.key);
        if (idx < lastPlacedIndex) {
          // 移动位置
          result.push({
            ...newItem,
            tag: PLACEMENT
          });
        } else {
          // 复用并更新位置
          lastPlacedIndex = idx;
          result.push(newItem);
        }
      } else {
        // 没有找到表示新增
        result.push({
          ...newItem,
          tag: PLACEMENT
        });
      }
    }
    // indexMap中还有剩下的话，说明剩下的都是要删除的，因为新节点中没有
    for (let [_, item] of indexRestMap) {
      result.push({
        ...item,
        tag: DELECTION
      });
    }
  } else if (newListRest.length) {
    // 需要更新，结果3
    newListRest.forEach((item) => {
      result.push({
        ...item,
        tag: PLACEMENT
      });
    });
  } else if (oldListRest.length) {
    // 需要删除，结果2
    oldListRest.forEach((item) => {
      result.push({
        ...item,
        tag: DELECTION
      });
    });
  }

  // 结果1 也是默认返回
  return result;
}

// 测试
// 结果1
const before = [new Node('a'), new Node('b'), new Node('c'), new Node('d')];
const after = [new Node('a'), new Node('b'), new Node('c'), new Node('d')];
console.log('demo1', diff(before, after));

// 结果2
const before1 = [new Node('a'), new Node('b'), new Node('c'), new Node('d')];
const after1 = [new Node('a'), new Node('b'), new Node('c')];
console.log('demo2', diff(before1, after1));

// 结果3
const before2 = [new Node('a'), new Node('b'), new Node('c')];
const after2 = [new Node('a'), new Node('b'), new Node('c'), new Node('d')];
console.log('demo3', diff(before2, after2));

// 结果4
const before3 = [new Node('a'), new Node('b'), new Node('c'), new Node('d')];
const after3 = [new Node('d'), new Node('a'), new Node('b'), new Node('c')];
console.log('demo4', diff(before3, after3));
const before4 = [new Node('a'), new Node('b'), new Node('c'), new Node('d')];
const after4 = [new Node('a'), new Node('c'), new Node('b'), new Node('d')];
console.log('demo5', diff(before4, after4));
