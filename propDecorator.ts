/* 参数装饰器 */

function prop(target: any, methodName: string, index: number) {
  console.log('target', target)
  console.log('methodName', methodName)
  console.log('index', index)
}

class Demo {
  add(@prop a: number, b: number) {
    return a + b
  }
}

const demo = new Demo()
demo.add(1,2)
