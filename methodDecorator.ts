/* 方法装饰器 */

// function method(target: any, propertyKey: any, descriptor: any) {
//   console.log(target, propertyKey, descriptor)
// }

// class Math {
//   constructor() {
//     console.log('实例化')
//   }
//   @method
//   add(a: number, b: number) {
//     return a + b
//   }
// }

// const math = new Math()

// math.add(1,2)

function validate<T extends (...args: any[]) => any>(
  validator: (...p: Parameters<T>) => boolean, 
  errorMsg: string
) {
  return function(target: any, propertyKey: string, descriptor: any) {
    const prevMethod = descriptor.value as T

    descriptor.value = function(...props: Parameters<T>) {
      if(!validator(...props)) {
        throw new Error(`${propertyKey}: ${errorMsg}`)
      }
      return prevMethod.apply(this, props)
    }

    return descriptor
  }
}

type Add = (a: number, b: number) => number;

class Math {

  @validate<Add>((a, b) => {
    if(a !== 1) return false
    return true
  }, '参数有误')
  add(a: number, b: number): number {
    return a + b
  }
}
const math = new Math()
console.log(math.add(2,2))
